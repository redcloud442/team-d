import { applyRateLimit } from "@/utils/function";
import prisma from "@/utils/prisma";
import { protectionMerchantUser } from "@/utils/serversideProtection";
import { NextRequest, NextResponse } from "next/server";

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

    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, note }: { status: string; note?: string | null } = body;

    if (!status || !["APPROVED", "PENDING", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid or missing status." },
        { status: 400 }
      );
    }

    const { teamMemberProfile } = await protectionMerchantUser();
    if (!teamMemberProfile) {
      return NextResponse.json(
        { error: "User authentication failed." },
        { status: 401 }
      );
    }

    await applyRateLimit(teamMemberProfile?.alliance_member_id, ip);

    const existingRequest =
      await prisma.alliance_top_up_request_table.findUnique({
        where: { alliance_top_up_request_id: requestId },
      });

    if (
      existingRequest &&
      existingRequest.alliance_top_up_request_status !== "PENDING"
    ) {
      return NextResponse.json(
        { error: "Request has already been processed." },
        { status: 400 }
      );
    }
    const allianceData = await prisma.alliance_top_up_request_table.update({
      where: { alliance_top_up_request_id: requestId },
      data: {
        alliance_top_up_request_status: status,
        alliance_top_up_request_approved_by:
          teamMemberProfile.alliance_member_id,
        alliance_top_up_request_reject_note: note ?? null,
      },
    });

    if (!allianceData) {
      return NextResponse.json(
        { error: "Failed to update top-up request." },
        { status: 500 }
      );
    }

    if (status === "APPROVED") {
      const [updatedEarnings, updatedMerchant] = await prisma.$transaction(
        async (tx) => {
          const merchant = await tx.merchant_member_table.findUnique({
            where: {
              merchant_member_id: teamMemberProfile.alliance_member_id,
            },
          });

          if (!merchant) {
            throw new Error("Merchant not found.");
          }

          if (
            allianceData.alliance_top_up_request_amount >
            merchant.merchant_member_balance
          ) {
            throw new Error("Insufficient merchant balance.");
          }
          const updatedEarnings = await tx.alliance_earnings_table.update({
            where: {
              alliance_earnings_member_id:
                allianceData.alliance_top_up_request_member_id,
            },
            data: {
              alliance_olympus_wallet: {
                increment: allianceData.alliance_top_up_request_amount,
              },
            },
          });

          const updatedMerchant = await tx.merchant_member_table.update({
            where: {
              merchant_member_id:
                allianceData.alliance_top_up_request_member_id,
            },
            data: {
              merchant_member_balance: {
                decrement: allianceData.alliance_top_up_request_amount,
              },
            },
          });

          return [updatedEarnings, updatedMerchant];
        }
      );

      if (!updatedEarnings) {
        return NextResponse.json(
          { error: "No earnings record found to update." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        balance: updatedMerchant?.merchant_member_balance,
      });
    } else {
      return NextResponse.json({
        success: true,
      });
    }
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
