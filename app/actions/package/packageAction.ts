"use server";

import { BONUS_TYPE, DIRECTYPE } from "@/utils/constant";
import { applyRateLimitMember } from "@/utils/function";
import prisma from "@/utils/prisma";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export const claimPackage = async (params: {
  packageConnectionId: string;
  amount: number;
}) => {
  try {
    const { packageConnectionId, amount } = params;

    if (!packageConnectionId || !amount) {
      throw new Error("Missing required fields in the request body.");
    }

    const { teamMemberProfile } = await protectionMemberUser();
    if (!teamMemberProfile) {
      throw new Error("User authentication failed.");
    }

    await applyRateLimitMember(teamMemberProfile.alliance_member_id);

    const packageConnection =
      await prisma.package_member_connection_table.findUnique({
        where: { package_member_connection_id: packageConnectionId },
      });

    if (!packageConnection) {
      throw new Error("Package connection not found.");
    }

    if (packageConnection.package_member_status === "ENDED") {
      throw new Error("Invalid request. Package already ended.");
    }

    await prisma.$transaction(async (tx) => {
      await tx.package_member_connection_table.update({
        where: { package_member_connection_id: packageConnectionId },
        data: { package_member_status: "ENDED" },
      });

      await tx.package_earnings_log.create({
        data: {
          package_member_connection_id: packageConnectionId,
          package_member_package_id:
            packageConnection.package_member_package_id,
          package_member_member_id: teamMemberProfile.alliance_member_id,
          package_member_connection_created:
            packageConnection.package_member_connection_created,
          package_member_amount: packageConnection.package_member_amount,
          package_member_amount_earnings: amount,
          package_member_status: "ENDED",
        },
      });
    });

    return { success: true };
  } catch (error) {
    throw new Error("Internal server error");
  }
};

export const availPackage = async (params: {
  amount: number;
  packageId: string;
  teamMemberId: string;
}) => {
  try {
    const { amount, packageId, teamMemberId } = params;
    console.log(amount, packageId, teamMemberId);
    // Consolidated input validation
    if (
      !amount ||
      !packageId ||
      !teamMemberId ||
      amount <= 0 ||
      amount.toString().length > 7 ||
      amount.toString().length < 3
    ) {
      return NextResponse.json(
        { error: "Invalid input or amount must be between 3 and 7 digits." },
        { status: 400 }
      );
    }

    const { teamMemberProfile } = await protectionMemberUser();

    await applyRateLimitMember(teamMemberId);

    const decimalAmount = new Prisma.Decimal(amount);

    const [packageData, earningsData, referralData] = await prisma.$transaction(
      [
        prisma.package_table.findUnique({
          where: { package_id: packageId },
          select: { package_percentage: true, package_is_disabled: true },
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

    if (!packageData) {
      return NextResponse.json(
        { error: "Package not found." },
        { status: 404 }
      );
    }

    if (packageData.package_is_disabled) {
      return NextResponse.json(
        { error: "Package is disabled." },
        { status: 400 }
      );
    }

    if (!earningsData) {
      return NextResponse.json(
        { error: "Earnings record not found." },
        { status: 404 }
      );
    }

    if (
      new Prisma.Decimal(earningsData.alliance_olympus_wallet).lt(decimalAmount)
    ) {
      return NextResponse.json(
        { error: "Insufficient balance in the alliance Olympus wallet." },
        { status: 400 }
      );
    }

    const packagePercentage = new Prisma.Decimal(
      packageData.package_percentage
    ).div(100);
    const packageAmountEarnings = decimalAmount
      .mul(packagePercentage)
      .toNumber();

    const referralChain = generateReferralChain(
      referralData?.alliance_referral_hierarchy ?? null,
      teamMemberId
    );

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
        data: { alliance_olympus_wallet: { decrement: amount } },
      });

      if (referralChain.length > 0) {
        const bountyLogs = referralChain.map((ref) => ({
          package_ally_bounty_member_id: ref.referrerId,
          package_ally_bounty_percentage: ref.percentage,
          package_ally_bounty_earnings: decimalAmount
            .mul(ref.percentage)
            .div(100)
            .toNumber(),
          package_ally_bounty_type:
            ref.level === 1 ? DIRECTYPE.DIRECT : DIRECTYPE.INDIRECT,
          package_ally_bounty_connection_id:
            connectionData.package_member_connection_id,
          package_ally_bounty_from: teamMemberId,
        }));

        await prisma.package_ally_bounty_log.createMany({ data: bountyLogs });

        await Promise.all(
          referralChain.map((ref) =>
            prisma.alliance_earnings_table.updateMany({
              where: { alliance_earnings_member_id: ref.referrerId },
              data: {
                [ref.level === 1 ? BONUS_TYPE.DIRECT : BONUS_TYPE.INDIRECT]: {
                  increment: decimalAmount
                    .mul(ref.percentage)
                    .div(100)
                    .toNumber(),
                },
              },
            })
          )
        );
      }

      return connectionData;
    });

    if (!teamMemberProfile?.alliance_member_is_active) {
      await prisma.alliance_member_table.update({
        where: { alliance_member_id: teamMemberId },
        data: {
          alliance_member_is_active: true,
          alliance_member_date_updated: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error." },
      { status: 500 }
    );
  }
};

function generateReferralChain(hierarchy: string | null, teamMemberId: string) {
  if (!hierarchy) return [];

  const hierarchyArray = hierarchy.split(".");
  const currentIndex = hierarchyArray.indexOf(teamMemberId);

  if (currentIndex === -1) {
    throw new Error("Current member ID not found in the hierarchy.");
  }

  return hierarchyArray
    .slice(0, currentIndex)
    .reverse()
    .map((referrerId, index) => ({
      referrerId,
      percentage: getBonusPercentage(index + 1),
      level: index + 1,
    }))
    .slice(0, 11);
}

function getBonusPercentage(level: number): number {
  const bonusMap: Record<number, number> = {
    1: 10,
    2: 1.5,
    3: 1.5,
    4: 1.5,
    5: 1,
    6: 1,
    7: 1,
    8: 1,
    9: 1,
    10: 1,
  };

  return bonusMap[level] || 0;
}
