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

    if (!amount || !packageId || !teamMemberId || amount === 0) {
      return NextResponse.json(
        { error: "Invalid input or amount cannot be zero." },
        { status: 400 }
      );
    }

    await protectionMemberUser();

    await applyRateLimit(teamMemberId, ip);

    const [packageData, amountMatch] = await prisma.$transaction([
      prisma.package_table.findUnique({
        where: { package_id: packageId },
        select: { package_percentage: true },
      }),
      prisma.alliance_earnings_table.findUnique({
        where: { alliance_earnings_member_id: teamMemberId },
      }),
    ]);

    if (!packageData) {
      return NextResponse.json(
        { error: "Package not found." },
        { status: 404 }
      );
    }

    if (!amountMatch) {
      return NextResponse.json(
        { error: "Earnings record not found." },
        { status: 404 }
      );
    }

    if (amountMatch.alliance_olympus_wallet < amount) {
      return NextResponse.json(
        { error: "Insufficient balance in the alliance Olympus wallet." },
        { status: 404 }
      );
    }

    const packagePercentage = packageData.package_percentage / 100;
    const packageAmountEarnings = amount * packagePercentage;

    const referralChain = await fetchReferralChain(teamMemberId);

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
        await prisma.package_ally_bounty_log.createMany({
          data: referralChain.map((ref) => ({
            package_ally_bounty_member_id: ref.referrerId ?? "",
            package_ally_bounty_percentage: ref.percentage,
            package_ally_bounty_earnings: amount * (ref.percentage / 100),
            package_ally_bounty_type: ref.level > 1 ? "INDIRECT" : "DIRECT",
            package_ally_bounty_connection_id:
              connectionData.package_member_connection_id,
          })),
        });
      }

      const bulkUpdateSQL = `
        UPDATE alliance_schema.alliance_earnings_table
        SET
            alliance_ally_bounty = alliance_ally_bounty + CASE
            WHEN data.level = 1 THEN data.bonus_amount
            ELSE 0
            END,
            alliance_legion_bounty = alliance_legion_bounty + CASE
            WHEN data.level > 1 THEN data.bonus_amount
            ELSE 0
            END
        FROM (VALUES ${referralChain
          .map(
            (_, index) =>
              `($${index * 3 + 1}::uuid, $${index * 3 + 2}::numeric, $${index * 3 + 3}::integer)`
          )
          .join(", ")}) AS data(member_id, bonus_amount, level)
        WHERE alliance_earnings_table.alliance_earnings_member_id = data.member_id;
    `;

      const queryParams = referralChain.flatMap((ref) => [
        ref.memberId,
        amount * (ref.percentage / 100),
        ref.level,
      ]);

      if (referralChain.length > 0) {
        await prisma.$executeRawUnsafe(bulkUpdateSQL, ...queryParams);
      }

      return connectionData;
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function fetchReferralChain(teamMemberId: string) {
  const referralChain = [];
  let currentMemberId = teamMemberId ?? "";

  while (currentMemberId) {
    const referral = await prisma.alliance_referral_table.findFirst({
      where: { alliance_referral_member_id: currentMemberId },
      select: {
        alliance_referral_from_member_id: true,
        alliance_referral_member_id: true,
        alliance_referral_level: true,
        alliance_referral_bonus_amount: true,
      },
    });

    if (!referral) break;

    referralChain.push({
      memberId: referral.alliance_referral_member_id,
      referrerId: referral.alliance_referral_from_member_id,
      percentage: referral.alliance_referral_bonus_amount,
      level: referral.alliance_referral_level,
    });

    currentMemberId = referral.alliance_referral_from_member_id ?? "";
  }

  return referralChain;
}
