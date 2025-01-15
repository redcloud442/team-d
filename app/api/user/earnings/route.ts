import prisma from "@/utils/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { memberId } = await request.json();
    const user = await prisma.dashboard_earnings_summary.findUnique({
      where: {
        member_id: memberId,
      },
    });

    const data = {
      directReferralAmount: user?.direct_referral_amount,
      indirectReferralAmount: user?.indirect_referral_amount,
      totalEarnings: user?.total_earnings,
      withdrawalAmount: user?.total_withdrawals,
      directReferralCount: user?.direct_referral_count,
      indirectReferralCount: user?.indirect_referral_count,
    };
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error." },
      { status: 500 }
    );
  }
}
