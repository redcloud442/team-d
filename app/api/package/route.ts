import { applyRateLimit } from "@/utils/function";
import prisma from "@/utils/prisma";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Retrieve the IP address with fallback
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    // Parse the request body
    const { amount, packageId, teamMemberId } = await request.json();

    // Validate input
    if (!amount || !packageId || !teamMemberId) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    if (amount === 0) {
      return NextResponse.json(
        { error: "Amount cannot be zero." },
        { status: 400 }
      );
    }

    // Protect user access
    await protectionMemberUser();

    // Apply rate limit
    await applyRateLimit(teamMemberId, ip);

    // Check if the earnings record exists
    const amountMatch = await prisma.alliance_earnings_table.findUnique({
      where: { alliance_earnings_member_id: teamMemberId },
    });

    if (!amountMatch) {
      return NextResponse.json(
        { error: "Earnings record not found." },
        { status: 404 }
      );
    }
    const transaction = await prisma.$transaction(async (prisma) => {
      const packageData = await prisma.package_table.findUnique({
        where: {
          package_id: packageId,
        },
        select: {
          package_percentage: true,
        },
      });

      if (!packageData) {
        throw new Error("Package not found");
      }

      const packagePercentage = packageData.package_percentage / 100;
      const packageAmountEarnings = amount * packagePercentage;

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
        where: {
          alliance_earnings_member_id: teamMemberId,
        },
        data: {
          alliance_olympus_wallet: {
            decrement: amount, // Decrement wallet balance
          },
        },
      });

      return;
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
