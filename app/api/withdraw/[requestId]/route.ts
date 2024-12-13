import { applyRateLimit } from "@/utils/function";
import prisma from "@/utils/prisma";
import { protectionAccountingUser } from "@/utils/serversideProtection";
import { NextRequest, NextResponse } from "next/server";

// Helper function for returning error responses
function sendErrorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ requestId: string }> }
) {
  try {
    // Retrieve IP address
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    // Get requestId from context
    const { requestId } = await context.params;

    if (!requestId) return sendErrorResponse("Request ID is required.");

    // Parse request body
    const { status, note }: { status: string; note?: string | null } =
      await request.json();

    // Validate status
    if (!status || !["APPROVED", "PENDING", "REJECTED"].includes(status)) {
      return sendErrorResponse("Invalid or missing status.");
    }

    // Authenticate user
    const { teamMemberProfile } = await protectionAccountingUser();
    if (!teamMemberProfile)
      return sendErrorResponse("User authentication failed.", 401);

    // Apply rate limit
    await applyRateLimit(teamMemberProfile.alliance_member_id, ip);

    const result = await prisma.$transaction(async (tx) => {
      const existingRequest =
        await tx.alliance_withdrawal_request_table.findUnique({
          where: { alliance_withdrawal_request_id: requestId },
        });

      if (existingRequest?.alliance_withdrawal_request_status !== "PENDING") {
        throw new Error("Request has already been processed.");
      }

      const updatedRequest = await tx.alliance_withdrawal_request_table.update({
        where: { alliance_withdrawal_request_id: requestId },
        data: {
          alliance_withdrawal_request_status: status,
          alliance_withdrawal_request_approved_by:
            teamMemberProfile.alliance_member_id,
          alliance_withdrawal_request_reject_note: note ?? null,
        },
      });

      if (status === "REJECTED") {
        const earningsType =
          updatedRequest.alliance_withdrawal_request_withdraw_type;

        const earningsField =
          earningsType === "TOTAL"
            ? "alliance_olympus_earnings"
            : earningsType === "DIRECT REFERRAL"
              ? "alliance_ally_bounty"
              : "alliance_legion_bounty";

        await tx.alliance_earnings_table.update({
          where: {
            alliance_earnings_member_id: teamMemberProfile.alliance_member_id,
          },
          data: {
            [earningsField]: {
              increment: updatedRequest.alliance_withdrawal_request_amount,
            },
          },
        });
      }

      return updatedRequest;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error in PUT request:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}
