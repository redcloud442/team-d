import { loginRateLimit } from "@/utils/function";
import prisma from "@/utils/prisma";
import {
  protectionAdminUser,
  protectionMerchantUser,
} from "@/utils/serversideProtection";
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

export async function POST(request: Request) {
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

    await protectionMerchantUser();

    loginRateLimit(ip);

    const { accountNumber, accountType, accountName } = await request.json();

    const merchant = await prisma.merchant_table.findFirst({
      where: { merchant_account_number: accountNumber },
    });

    if (merchant) {
      return NextResponse.json(
        { error: "Merchant Already Exists" },
        { status: 400 }
      );
    }

    await prisma.merchant_table.create({
      data: {
        merchant_account_number: accountNumber,
        merchant_account_type: accountType,
        merchant_account_name: accountName,
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

export async function DELETE(request: Request) {
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

    await protectionMerchantUser();

    loginRateLimit(ip);

    const { merchantId } = await request.json();

    const merchant = await prisma.merchant_table.findFirst({
      where: { merchant_id: merchantId },
    });

    if (!merchant) {
      return NextResponse.json(
        { error: "Merchant Not Found" },
        { status: 400 }
      );
    }

    await prisma.merchant_table.delete({
      where: { merchant_id: merchantId },
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
