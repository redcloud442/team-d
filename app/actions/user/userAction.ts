"use server";

import { applyRateLimitMember } from "@/utils/function";
import prisma from "@/utils/prisma";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { alliance_earnings_table } from "@prisma/client";

export const getUserEarnings = async (params: { memberId: string }) => {
  try {
    const { memberId } = params;

    await protectionMemberUser(memberId);

    applyRateLimitMember(memberId);

    const user = await prisma.dashboard_earnings_summary.findUnique({
      where: {
        member_id: memberId,
      },
    });

    const userEarnings = await prisma.alliance_earnings_table.findUnique({
      where: {
        alliance_earnings_member_id: memberId,
      },
      select: {
        alliance_olympus_wallet: true,
        alliance_olympus_earnings: true,
        alliance_combined_earnings: true,
        alliance_referral_bounty: true,
      },
    });
    const totalEarnings = {
      directReferralAmount: user?.direct_referral_amount,
      indirectReferralAmount: user?.indirect_referral_amount,
      totalEarnings: user?.total_earnings,
      withdrawalAmount: user?.total_withdrawals,
      directReferralCount: user?.direct_referral_count,
      indirectReferralCount: user?.indirect_referral_count,
    };

    const userEarningsData = {
      ...userEarnings,
    };

    return {
      totalEarnings,
      userEarningsData: userEarningsData as unknown as alliance_earnings_table,
    };
  } catch (error) {
    throw new Error("Failed to fetch user earnings");
  }
};
