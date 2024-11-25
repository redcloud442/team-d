import { applyRateLimit } from "@/utils/function";
import prisma from "@/utils/prisma";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Retrieve IP address with fallback
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    // Parse request body
    const { earnings, accountNumber, amount, bank, teamMemberId } =
      await request.json();

    // Input validation
    if (!amount || !accountNumber || !bank || !teamMemberId) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than zero." },
        { status: 400 }
      );
    }

    // Protect user access
    await protectionMemberUser();

    // Apply rate limiting
    await applyRateLimit(teamMemberId, ip);

    // Fetch earnings record
    const amountMatch = await prisma.alliance_earnings_table.findUnique({
      where: { alliance_earnings_member_id: teamMemberId },
    });

    if (!amountMatch) {
      return NextResponse.json(
        { error: "Earnings record not found." },
        { status: 404 }
      );
    }

    // Determine maximum allowable amount
    const maxAmount =
      earnings === "TOTAL"
        ? amountMatch.alliance_olympus_earnings
        : earnings === "ALLY BOUNTY"
          ? amountMatch.alliance_ally_bounty
          : earnings === "LEGION BOUNTY"
            ? amountMatch.alliance_legion_bounty
            : 0;

    if (amount > maxAmount) {
      return NextResponse.json(
        { error: "Amount exceeds available earnings." },
        { status: 400 }
      );
    }

    const [allianceData] = await prisma.$transaction([
      prisma.alliance_withdrawal_request_table.create({
        data: {
          alliance_withdrawal_request_amount: Number(amount),
          alliance_withdrawal_request_type: bank,
          alliance_withdrawal_request_account: accountNumber,
          alliance_withdrawal_request_status: "APPROVED",
          alliance_withdrawal_request_member_id: teamMemberId,
        },
      }),
      prisma.alliance_earnings_table.update({
        where: { alliance_earnings_member_id: teamMemberId },
        data: {
          alliance_olympus_earnings:
            amountMatch.alliance_olympus_earnings - amount,
        },
      }),
    ]);

    if (!allianceData) {
      return NextResponse.json(
        {
          error: "Failed to create withdrawal request. Please try again later.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
