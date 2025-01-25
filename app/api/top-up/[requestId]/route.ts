import { TOP_UP_STATUS } from "@/utils/constant";
import prisma from "@/utils/prisma";
import { rateLimit } from "@/utils/redis/redis";
import { protectionMerchantUser } from "@/utils/serversideProtection";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Helper function for returning error responses
function sendErrorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

const updateTopUpRequestSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  note: z.string().optional(),
  requestId: z.string().uuid(),
});

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ requestId: string }> }
) {
  try {
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    const { requestId } = await context.params;

    if (!requestId) return sendErrorResponse("Invalid request.");

    const { status, note }: { status: string; note?: string | null } =
      await request.json();

    if (!status || !Object.values(TOP_UP_STATUS).includes(status)) {
      return sendErrorResponse("Invalid request.");
    }

    const validate = updateTopUpRequestSchema.safeParse({
      status,
      note,
      requestId,
    });

    if (!validate.success) {
      return NextResponse.json(
        { error: validate.error.message },
        { status: 400 }
      );
    }

    const { teamMemberProfile } = await protectionMerchantUser(ip);

    if (!teamMemberProfile) {
      return sendErrorResponse("User authentication failed.", 401);
    }

    const isAllowed = await rateLimit(
      `rate-limit:${teamMemberProfile?.alliance_member_id}`,
      50,
      60
    );

    if (!isAllowed) {
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const [merchant] = await Promise.all([
      prisma.merchant_member_table.findFirst({
        where: {
          merchant_member_merchant_id: teamMemberProfile.alliance_member_id,
        },
      }),
    ]);

    if (!merchant && teamMemberProfile.alliance_member_role === "MERCHANT")
      return sendErrorResponse("Merchant not found.", 404);

    if (!merchant && teamMemberProfile.alliance_member_role === "MERCHANT")
      return sendErrorResponse("Merchant not found.", 404);

    const result = await prisma.$transaction(async (tx) => {
      const existingRequest = await tx.alliance_top_up_request_table.findUnique(
        {
          where: {
            alliance_top_up_request_id: requestId,
          },
        }
      );

      if (!existingRequest) {
        throw new Error("Request not found.");
      }

      const updatedRequest = await tx.alliance_top_up_request_table.update({
        where: { alliance_top_up_request_id: requestId },
        data: {
          alliance_top_up_request_status: status,
          alliance_top_up_request_approved_by:
            teamMemberProfile.alliance_member_id,
          alliance_top_up_request_reject_note: note ?? null,
        },
      });

      await tx.alliance_transaction_table.create({
        data: {
          transaction_description: `Deposit ${status.slice(0, 1).toUpperCase() + status.slice(1).toLowerCase()} ${note ? `(${note})` : ""}`,
          transaction_details: `Account Name: ${updatedRequest.alliance_top_up_request_name} | Account Number: ${updatedRequest.alliance_top_up_request_account}`,
          transaction_amount: updatedRequest.alliance_top_up_request_amount,
          transaction_member_id:
            updatedRequest.alliance_top_up_request_member_id,
        },
      });

      if (status === TOP_UP_STATUS.APPROVED) {
        const updatedEarnings = await tx.alliance_earnings_table.update({
          where: {
            alliance_earnings_member_id:
              updatedRequest.alliance_top_up_request_member_id,
          },
          data: {
            alliance_olympus_wallet: {
              increment: updatedRequest.alliance_top_up_request_amount,
            },
            alliance_combined_earnings: {
              increment: updatedRequest.alliance_top_up_request_amount,
            },
          },
        });

        if (merchant) {
          const updatedMerchant = await tx.merchant_member_table.update({
            where: { merchant_member_id: merchant.merchant_member_id },
            data: {
              merchant_member_balance: {
                decrement: updatedRequest.alliance_top_up_request_amount,
              },
            },
          });

          return {
            updatedRequest,
            updatedEarnings,
            updatedMerchant,
          };
        }

        return { updatedRequest, updatedEarnings };
      }

      return { updatedRequest };
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected error occurred.",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
