import { WITHDRAWAL_STATUS } from "@/utils/constant";
import {
  applyRateLimit,
  calculateFee,
  calculateFinalAmount,
  escapeFormData,
} from "@/utils/function";
import prisma from "@/utils/prisma";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { createClientServerSide } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    const { teamMemberProfile } = await protectionMemberUser();

    await applyRateLimit(teamMemberProfile?.alliance_member_id || "", ip);

    const supabaseClient = await createClientServerSide();

    const url = new URL(request.url);
    const page = url.searchParams.get("page") || "1";
    const limit = url.searchParams.get("limit") || "10";
    const search = url.searchParams.get("search") || "";
    const columnAccessor = url.searchParams.get("columnAccessor") || "";
    const isAscendingSort = url.searchParams.get("isAscendingSort") || "false";
    const userId = url.searchParams.get("userId") || "";

    if (limit !== "10") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const params = {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      columnAccessor,
      userId: userId,
      isAscendingSort: isAscendingSort === "true",
      teamId: teamMemberProfile?.alliance_member_alliance_id || "",
    };
    const escapedParams = escapeFormData(params);
    const { data, error } = await supabaseClient.rpc(
      "get_member_withdrawal_history",
      {
        input_data: escapedParams,
      }
    );

    if (error) throw error;
    const { data: withdrawals, totalCount } = data;
    return NextResponse.json({ success: true, data: withdrawals, totalCount });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
const withdrawalFormSchema = z.object({
  earnings: z.string(),
  amount: z
    .string()
    .min(3, "Minimum amount is required atleast 200 pesos")
    .refine((amount) => parseInt(amount, 10) > 200, {
      message: "Amount must be at least 200 pesos",
    }),
  bank: z.string().min(1, "Please select a bank"),
  accountName: z
    .string()
    .min(6, "Account name is required")
    .max(40, "Account name must be at most 24 characters"),
  accountNumber: z
    .string()
    .min(6, "Account number is required")
    .max(24, "Account number must be at most 24 digits"),
});

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    const { earnings, accountNumber, accountName, amount, bank, teamMemberId } =
      await request.json();

    const withdrawalData = withdrawalFormSchema.safeParse({
      earnings,
      accountNumber,
      accountName,
      amount,
      bank,
    });

    if (!withdrawalData.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    if (!["TOTAL"].includes(earnings)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    if (Number(amount) <= 0 || Number(amount) < 200) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const { teamMemberProfile } = await protectionMemberUser(ip);

    await applyRateLimit(teamMemberId, ip);

    const amountMatch = await prisma.alliance_earnings_table.findUnique({
      where: { alliance_earnings_member_id: teamMemberId },
      select: {
        alliance_olympus_earnings: true,
        alliance_referral_bounty: true,
        alliance_combined_earnings: true,
      },
    });

    if (!amountMatch || !teamMemberProfile?.alliance_member_is_active) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const {
      alliance_olympus_earnings,
      alliance_referral_bounty,
      alliance_combined_earnings,
    } = amountMatch;

    if (Number(amount) > alliance_combined_earnings) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    // Calculate proportional deductions
    let remainingAmount = Number(amount);
    const olympusDeduction = Math.min(
      remainingAmount,
      alliance_olympus_earnings
    );
    remainingAmount -= olympusDeduction;

    const referralDeduction = Math.min(
      remainingAmount,
      alliance_referral_bounty
    );
    remainingAmount -= referralDeduction;

    if (remainingAmount > 0) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    // Transaction logic
    const [allianceData] = await prisma.$transaction([
      prisma.alliance_withdrawal_request_table.create({
        data: {
          alliance_withdrawal_request_amount: Number(amount),
          alliance_withdrawal_request_type: bank,
          alliance_withdrawal_request_account: accountNumber,
          alliance_withdrawal_request_fee: calculateFee(
            Number(amount),
            earnings
          ),
          alliance_withdrawal_request_withdraw_amount: calculateFinalAmount(
            Number(amount),
            earnings
          ),
          alliance_withdrawal_request_bank_name: accountName,
          alliance_withdrawal_request_status: WITHDRAWAL_STATUS.PENDING,
          alliance_withdrawal_request_member_id: teamMemberId,
          alliance_withdrawal_request_earnings_amount: olympusDeduction,
          alliance_withdrawal_request_referral_amount: referralDeduction,
          alliance_withdrawal_request_withdraw_type: earnings,
        },
      }),
      prisma.alliance_earnings_table.update({
        where: { alliance_earnings_member_id: teamMemberId },
        data: {
          alliance_olympus_earnings: { decrement: olympusDeduction },
          alliance_referral_bounty: { decrement: referralDeduction },
          alliance_combined_earnings: { decrement: Number(amount) },
        },
      }),
      prisma.alliance_transaction_table.create({
        data: {
          transaction_amount: Number(calculateFee(Number(amount), earnings)),
          transaction_description: "Withdrawal Pending",
          transaction_member_id: teamMemberId,
        },
      }),
    ]);

    if (!allianceData) {
      return NextResponse.json(
        {
          error: "Failed to create withdrawal request. Please try again later.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
