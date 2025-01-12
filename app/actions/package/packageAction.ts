"use server";

import { DIRECTYPE } from "@/utils/constant";
import { applyRateLimitMember } from "@/utils/function";
import prisma from "@/utils/prisma";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export const claimPackage = async (params: {
  packageConnectionId: string;
  amount: number;
  earnings: number;
}) => {
  try {
    const { packageConnectionId, amount, earnings } = params;

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

      await tx.alliance_earnings_table.update({
        where: {
          alliance_earnings_member_id: teamMemberProfile.alliance_member_id,
        },
        data: {
          alliance_olympus_earnings: { increment: amount + earnings },
          alliance_combined_earnings: { increment: amount + earnings },
        },
      });

      await tx.alliance_transaction_table.create({
        data: {
          transaction_member_id: teamMemberProfile.alliance_member_id,
          transaction_amount: amount + earnings,
          transaction_description: "Package Claimed",
        },
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
          package_member_amount_earnings: amount + earnings,
          package_member_status: "ENDED",
        },
      });
    });

    return { success: true };
  } catch (error) {
    throw new Error("Internal server error");
  }
};

export const availPackageData = async (params: {
  amount: number;
  packageId: string;
  teamMemberId: string;
}) => {
  try {
    const { amount, packageId, teamMemberId } = params;

    // Consolidated input validation
    if (
      !amount ||
      !packageId ||
      !teamMemberId ||
      amount <= 0 ||
      Math.floor(amount).toString().length > 7 || // Ignore decimal places for length
      Math.floor(amount).toString().length < 3 // Ignore decimal places for length
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
          select: {
            alliance_olympus_wallet: true,
            alliance_referral_bounty: true,
            alliance_combined_earnings: true,
          },
        }),
        prisma.alliance_referral_table.findFirst({
          where: { alliance_referral_member_id: teamMemberId },
          select: { alliance_referral_hierarchy: true },
        }),
      ]
    );

    if (!packageData) {
      throw new Error("Package not found.");
    }

    if (packageData.package_is_disabled) {
      throw new Error("Package is disabled.");
    }

    if (!earningsData) {
      throw new Error("Earnings record not found.");
    }

    const {
      alliance_olympus_wallet,
      alliance_referral_bounty,
      alliance_combined_earnings,
    } = earningsData;

    // Ensure sufficient balance in the combined wallet
    if (alliance_combined_earnings < amount) {
      throw new Error("Insufficient balance in the combined wallet.");
    }

    // Deduct from the wallets
    const { combinedWallet, olympusWallet, referralWallet } =
      deductFromCombinedWallet(
        amount,
        alliance_combined_earnings,
        alliance_olympus_wallet,
        alliance_referral_bounty
      );

    // Calculate earnings
    const packagePercentage = new Prisma.Decimal(
      packageData.package_percentage
    ).div(100);
    const packageAmountEarnings = decimalAmount
      .mul(packagePercentage)
      .toNumber();

    // Generate referral chain with a capped depth
    const referralChain = generateReferralChain(
      referralData?.alliance_referral_hierarchy ?? null,
      teamMemberId,
      100 // Cap the depth to 100 levels
    );
    // Generate referral chain with a capped depth

    const transaction = await prisma.$transaction(async (prisma) => {
      // Create package member connection
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

      // Update the earnings table
      await prisma.alliance_earnings_table.update({
        where: { alliance_earnings_member_id: teamMemberId },
        data: {
          alliance_combined_earnings: combinedWallet,
          alliance_olympus_wallet: olympusWallet,
          alliance_referral_bounty: referralWallet,
        },
      });

      // Process referral chain in batches
      if (referralChain.length > 0) {
        const batchSize = 100; // Process in batches of 100
        for (let i = 0; i < referralChain.length; i += batchSize) {
          const batch = referralChain.slice(i, i + batchSize);

          // Create bounty logs
          const bountyLogs = batch.map((ref) => ({
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

          // Update earnings for the batch using Prisma's native methods
          for (const ref of batch) {
            await prisma.alliance_earnings_table.update({
              where: { alliance_earnings_member_id: ref.referrerId },
              data: {
                alliance_referral_bounty: {
                  increment: decimalAmount
                    .mul(ref.percentage)
                    .div(100)
                    .toNumber(),
                },
              },
            });
          }
        }
      }

      return connectionData;
    });

    // Activate team member if inactive
    if (!teamMemberProfile?.alliance_member_is_active) {
      await prisma.alliance_member_table.update({
        where: { alliance_member_id: teamMemberId },
        data: {
          alliance_member_is_active: true,
          alliance_member_date_updated: new Date(),
        },
      });
    }

    return { success: true, transaction };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error." };
  }
};

function generateReferralChain(
  hierarchy: string | null,
  teamMemberId: string,
  maxDepth = 100
) {
  if (!hierarchy) return [];

  const hierarchyArray = hierarchy.split(".");
  const currentIndex = hierarchyArray.indexOf(teamMemberId);

  if (currentIndex === -1) {
    throw new Error("Current member ID not found in the hierarchy.");
  }

  return hierarchyArray
    .slice(0, currentIndex)
    .reverse()
    .slice(0, maxDepth)
    .map((referrerId, index) => ({
      referrerId,
      percentage: getBonusPercentage(index + 1),
      level: index + 1,
    }));
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

function deductFromCombinedWallet(
  amount: number,
  combinedWallet: number,
  olympusWallet: number,
  referralWallet: number
) {
  if (combinedWallet < amount) {
    throw new Error("Invalid request.");
  }

  let remaining = amount;
  combinedWallet -= amount; // Deduct directly from the combined wallet

  // Deduct from Olympus Wallet first
  if (olympusWallet >= remaining) {
    olympusWallet -= remaining;
    remaining = 0;
  } else {
    remaining -= olympusWallet;
    olympusWallet = 0;
  }

  // Deduct from Referral Wallet next
  if (remaining > 0 && referralWallet >= remaining) {
    referralWallet -= remaining;
    remaining = 0;
  }

  if (remaining > 0) {
    throw new Error("Invalid request.");
  }

  return { combinedWallet, olympusWallet, referralWallet };
}
