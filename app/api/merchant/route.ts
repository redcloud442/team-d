import { loginRateLimit } from "@/utils/function";
import prisma from "@/utils/prisma";
import {
  protectionAdminUser,
  protectionAllUser,
  protectionMerchantUser,
} from "@/utils/serversideProtection";
import { createClientSide } from "@/utils/supabase/client";
import { NextResponse } from "next/server";

function sendErrorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function PATCH(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    if (ip === "unknown")
      return sendErrorResponse(
        "Unable to determine IP address for rate limiting."
      );

    await protectionAdminUser(ip);
    loginRateLimit(ip);

    const { amount, memberId } = await request.json();

    const result = await prisma.$transaction(async (tx) => {
      const merchant = await tx.merchant_member_table.findFirst({
        where: { merchant_member_id: memberId },
      });

      if (!merchant) throw new Error("Merchant not found");

      return await tx.merchant_member_table.update({
        where: { merchant_member_id: memberId },
        data: {
          merchant_member_balance: {
            increment: amount,
          },
        },
      });
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error in PATCH request:", error);
    return sendErrorResponse(
      error instanceof Error ? error.message : "Unknown error.",
      500
    );
  }
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    if (ip === "unknown")
      return sendErrorResponse(
        "Unable to determine IP address for rate limiting."
      );

    await protectionMerchantUser(ip);
    loginRateLimit(ip);

    const { accountNumber, accountType, accountName } = await request.json();

    const result = await prisma.$transaction(async (tx) => {
      const merchant = await tx.merchant_table.findFirst({
        where: { merchant_account_number: accountNumber },
      });

      if (merchant) throw new Error("Merchant already exists");

      return await tx.merchant_table.create({
        data: {
          merchant_account_number: accountNumber,
          merchant_account_type: accountType,
          merchant_account_name: accountName,
        },
      });
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error in POST request:", error);
    return sendErrorResponse(
      error instanceof Error ? error.message : "Unknown error.",
      500
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    if (ip === "unknown")
      return sendErrorResponse(
        "Unable to determine IP address for rate limiting."
      );

    await protectionMerchantUser(ip);
    loginRateLimit(ip);

    const { merchantId } = await request.json();

    const result = await prisma.$transaction(async (tx) => {
      const merchant = await tx.merchant_table.findFirst({
        where: { merchant_id: merchantId },
      });

      if (!merchant) throw new Error("Merchant not found");

      return await tx.merchant_table.delete({
        where: { merchant_id: merchantId },
      });
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error in DELETE request:", error);
    return sendErrorResponse(
      error instanceof Error ? error.message : "Unknown error.",
      500
    );
  }
}

export async function GET(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    if (ip === "unknown")
      return sendErrorResponse(
        "Unable to determine IP address for rate limiting."
      );

    const { teamMemberProfile } = await protectionAllUser(ip);
    loginRateLimit(ip);
    const supabaseClient = createClientSide();
    const params = {
      teamMemberId: teamMemberProfile?.alliance_member_id || "",
    };
    const { data, error } = await supabaseClient.rpc("get_merchant_option", {
      input_data: params,
    });

    if (error) {
      throw error;
    }
    return NextResponse.json({ success: true, data: data });
  } catch (error) {
    console.error("Error in GET request:", error);
    return sendErrorResponse(
      error instanceof Error ? error.message : "Unknown error.",
      500
    );
  }
}
