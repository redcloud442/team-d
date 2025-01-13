"use server";

import { TopUpFormValues } from "@/components/DashboardPage/DashboardDepositRequest/DashboardDepositModal/DashboardDepositModalDeposit";
import { applyRateLimitMember } from "@/utils/function";
import prisma from "@/utils/prisma";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { createClientServerSide } from "@/utils/supabase/server";

export const depositWalletData = async (params: {
  TopUpFormValues: TopUpFormValues;
  publicUrl: string;
}) => {
  const publicUrl = params.publicUrl;
  const supabase = await createClientServerSide();
  try {
    const { teamMemberProfile } = await protectionMemberUser();

    if (!teamMemberProfile?.alliance_member_id) {
      throw new Error("Member ID is required");
    }

    await applyRateLimitMember(teamMemberProfile.alliance_member_id);

    const { amount, topUpMode, accountName, accountNumber } =
      params.TopUpFormValues;

    if (!amount || !topUpMode || !accountName || !accountNumber || !publicUrl) {
      throw new Error("All fields are required.");
    }

    if (amount.length > 7 || amount.length < 3) {
      throw new Error("Invalid Request.");
    }

    if (parseInt(amount, 10) < 200) {
      throw new Error("Invalid Request.");
    }

    const merchantData = await prisma.merchant_table.findFirst({
      where: {
        merchant_account_name: accountName,
        merchant_account_number: accountNumber,
      },
      select: {
        merchant_account_name: true,
        merchant_account_number: true,
        merchant_account_type: true,
      },
    });

    if (!merchantData) {
      throw new Error("Invalid Request.");
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.alliance_top_up_request_table.create({
          data: {
            alliance_top_up_request_amount: Number(amount),
            alliance_top_up_request_type: topUpMode,
            alliance_top_up_request_name: accountName,
            alliance_top_up_request_account: accountNumber,
            alliance_top_up_request_attachment: publicUrl,
            alliance_top_up_request_member_id:
              teamMemberProfile.alliance_member_id,
          },
        });
        await tx.alliance_transaction_table.create({
          data: {
            transaction_amount: Number(amount),
            transaction_description: "Deposit Pending",
            transaction_member_id: teamMemberProfile.alliance_member_id,
          },
        });
      });

      return { success: true };
    } catch (dbError) {
      throw new Error("Internal Server Error.");
    }
  } catch (error) {
    await supabase.storage.from("REQUEST_ATTACHMENTS").remove([publicUrl]);
    throw new Error("Internal Server Error.");
  }
};
