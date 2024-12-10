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

    const { amount, packageId, teamMemberId } = await request.json();

    if (!amount || !packageId || !teamMemberId || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid input or amount must be greater than zero." },
        { status: 400 }
      );
    }

    if (amount.toString().length > 10) {
      return NextResponse.json(
        { error: "Amount cannot be greater than 10 digits." },
        { status: 400 }
      );
    }

    await protectionMemberUser();
    await applyRateLimit(teamMemberId, ip);

    // Fetch package data, earnings, and referral hierarchy in a single transaction
    const [packageData, earningsData, referralData] = await prisma.$transaction(
      [
        prisma.package_table.findUnique({
          where: { package_id: packageId },
          select: { package_percentage: true },
        }),
        prisma.alliance_earnings_table.findUnique({
          where: { alliance_earnings_member_id: teamMemberId },
          select: { alliance_olympus_wallet: true },
        }),
        prisma.alliance_referral_table.findFirst({
          where: { alliance_referral_member_id: teamMemberId },
          select: { alliance_referral_hierarchy: true },
        }),
      ]
    );

    // Early validation checks
    if (!packageData) {
      return NextResponse.json(
        { error: "Package not found." },
        { status: 404 }
      );
    }

    if (!earningsData) {
      return NextResponse.json(
        { error: "Earnings record not found." },
        { status: 404 }
      );
    }

    if (earningsData.alliance_olympus_wallet < amount) {
      return NextResponse.json(
        { error: "Insufficient balance in the alliance Olympus wallet." },
        { status: 400 }
      );
    }

    const packagePercentage = packageData.package_percentage / 100;
    const packageAmountEarnings = amount * packagePercentage;

    // Generate the referral chain
    const referralChain = generateReferralChain(
      referralData?.alliance_referral_hierarchy ?? null,
      teamMemberId
    );

    // Execute the transaction
    const transaction = await prisma.$transaction(async (prisma) => {
      const connectionData =
        await prisma.package_member_connection_table.create({
          data: {
            package_member_member_id: teamMemberId,
            package_member_package_id: packageId,
            package_member_amount: amount,
            package_amount_earnings: packageAmountEarnings,
            package_member_status: "ACTIVE",
          },
        });

      await prisma.alliance_earnings_table.update({
        where: { alliance_earnings_member_id: teamMemberId },
        data: {
          alliance_olympus_wallet: { decrement: amount },
        },
      });

      if (referralChain.length > 0) {
        const bountyLogs = referralChain.map((ref) => ({
          package_ally_bounty_member_id: ref.referrerId,
          package_ally_bounty_percentage: ref.percentage,
          package_ally_bounty_earnings: amount * (ref.percentage / 100),
          package_ally_bounty_type: ref.level > 1 ? "INDIRECT" : "DIRECT",
          package_ally_bounty_connection_id:
            connectionData.package_member_connection_id,
        }));

        await prisma.package_ally_bounty_log.createMany({ data: bountyLogs });
      }

      return connectionData;
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Optimized function to generate referral chain
function generateReferralChain(hierarchy: string | null, teamMemberId: string) {
  const referralChain: {
    referrerId: string;
    percentage: number;
    level: number;
  }[] = [];

  if (!hierarchy) return referralChain;

  const hierarchyArray = hierarchy.split(".");
  const currentIndex = hierarchyArray.indexOf(teamMemberId);

  if (currentIndex === -1) {
    throw new Error("Current member ID not found in the hierarchy.");
  }

  // Collect up to 12 levels of referrers
  for (
    let i = currentIndex - 1, level = 1;
    i >= 0 && level <= 12;
    i--, level++
  ) {
    referralChain.push({
      referrerId: hierarchyArray[i],
      percentage: getBonusPercentage(level),
      level: level,
    });
  }

  return referralChain;
}

// Function to determine the bonus percentage based on the level
function getBonusPercentage(level: number): number {
  const bonusMap: Record<number, number> = {
    1: 10,
    2: 5,
    3: 5,
    4: 3,
    5: 3,
    6: 2,
    7: 2,
    8: 2,
    9: 1,
    10: 1,
    11: 1,
    12: 1,
  };

  return bonusMap[level] || 0;
}
