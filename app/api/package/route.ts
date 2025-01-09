import { BONUS_TYPE, DIRECTYPE } from "@/utils/constant";
import { applyRateLimit } from "@/utils/function";
import prisma from "@/utils/prisma";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { createClientServerSide } from "@/utils/supabase/server";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    const { amount, packageId, teamMemberId } = await request.json();

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

    const { teamMemberProfile } = await protectionMemberUser(ip);
    await applyRateLimit(teamMemberId, ip);

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
            package_member_status: DIRECTYPE.DIRECT,
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
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    const { teamMemberProfile } = await protectionMemberUser(ip);

    await applyRateLimit(teamMemberProfile?.alliance_member_id || "", ip);

    const supabaseClient = await createClientServerSide();

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const page = url.searchParams.get("page") || 1;
    const limit = url.searchParams.get("limit") || 10;
    const sortBy = url.searchParams.get("sortBy") || true;
    const columnAccessor = url.searchParams.get("columnAccessor") || "";
    const teamMemberId = url.searchParams.get("teamMemberId") || "";

    const { data, error } = await supabaseClient.rpc(
      "get_member_package_history",
      {
        input_data: {
          search,
          page,
          limit,
          sortBy,
          columnAccessor,
          teamMemberId,
        },
      }
    );

    if (error) throw error;

    return NextResponse.json({ success: true, data: data });
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error." },
      { status: 500 }
    );
  }
}

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
    2: 3,
    3: 2,
    4: 1,
    5: 1,
    6: 1,
    7: 1,
    8: 1,
    9: 1,
    10: 1,
  };

  return bonusMap[level] || 0;
}
