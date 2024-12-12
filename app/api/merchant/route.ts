import { loginRateLimit } from "@/utils/function";
import prisma from "@/utils/prisma";
import { protectionAdminUser } from "@/utils/serversideProtection";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    if (ip === "unknown") {
      return NextResponse.json(
        { error: "Unable to determine IP address for rate limiting." },
        { status: 400 }
      );
    }

    await protectionAdminUser();

    loginRateLimit(ip);

    const { amount, memberId } = await request.json();

    const merchant = await prisma.merchant_member_table.findFirst({
      where: { merchant_member_id: memberId },
    });

    if (!merchant) {
      return NextResponse.json(
        { error: "Merchant not found" },
        { status: 400 }
      );
    }

    await prisma.merchant_member_table.update({
      where: { merchant_member_id: memberId },
      data: {
        merchant_member_balance: {
          increment: amount,
        },
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error." },
      { status: 500 }
    );
  }
}
