import { applyRateLimitMember } from "@/utils/function";
import prisma from "@/utils/prisma";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { teamMemberProfile } = await protectionMemberUser();

    await applyRateLimitMember(teamMemberProfile?.alliance_member_id || "");

    const directReferralAggregate =
      await prisma.package_ally_bounty_log.aggregate({
        where: {
          package_ally_bounty_member_id: teamMemberProfile?.alliance_member_id,
          package_ally_bounty_type: "DIRECT",
        },
        _sum: {
          package_ally_bounty_earnings: true,
        },
        _count: {
          _all: true,
        },
      });

    const indirectReferralAggregate =
      await prisma.dashboard_earnings_summary.findUnique({
        where: {
          member_id: teamMemberProfile?.alliance_member_id,
        },
        select: {
          indirect_referral_amount: true,
          indirect_referral_count: true,
          direct_referral_amount: true,
          direct_referral_count: true,
        },
      });

    return NextResponse.json({
      direct: {
        sum: directReferralAggregate._sum.package_ally_bounty_earnings || 0,
        count: directReferralAggregate._count._all || 0,
      },
      indirect: {
        sum: indirectReferralAggregate?.indirect_referral_amount || 0,
        count: indirectReferralAggregate?.indirect_referral_count || 0,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
