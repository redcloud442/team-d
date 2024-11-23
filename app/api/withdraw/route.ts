import { applyRateLimit } from "@/utils/function";
import prisma from "@/utils/prisma";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    const body = await request.json();

    const { earnings, accountNumber, amount, bank, teamMemberId } = body;

    if (amount === 0)
      return NextResponse.json({ error: "Not allowed" }, { status: 404 });

    await protectionMemberUser();

    await applyRateLimit(teamMemberId, ip);

    const amountMatch = await prisma.alliance_earnings_table.findUnique({
      where: { alliance_earnings_member_id: teamMemberId },
    });

    if (!amountMatch) {
      return NextResponse.json(
        { error: "Earnings record not found." },
        { status: 404 }
      );
    }

    const maxAmount =
      earnings === "TOTAL"
        ? amountMatch.alliance_olympus_earnings
        : earnings === "ALLY AND BOUNTY"
          ? amountMatch.alliance_legion_bounty +
            amountMatch.alliance_ally_bounty
          : 0;

    if (amount > maxAmount) {
      return NextResponse.json(
        { error: "Amount exceeds available earnings." },
        { status: 400 }
      );
    }

    const allianceData = await prisma.alliance_withdrawal_request_table.create({
      data: {
        alliance_withdrawal_request_amount: Number(amount),
        alliance_withdrawal_request_type: bank,
        alliance_withdrawal_request_account: accountNumber,
        alliance_withdrawal_request_status: "APPROVED",
        alliance_withdrawal_request_member_id: teamMemberId,
      },
    });

    if (!allianceData) {
      return NextResponse.json(
        {
          error: "Failed to create withdrawal request. Please try again later.",
        },
        { status: 500 }
      );
    }
    const finalAmount = amountMatch.alliance_olympus_earnings - amount;

    await prisma.alliance_earnings_table.update({
      where: {
        alliance_earnings_member_id: teamMemberId,
      },
      data: {
        alliance_olympus_earnings: finalAmount,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message, stack: error.stack },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "An unexpected error occurred.", details: error },
      { status: 500 }
    );
  }
}
