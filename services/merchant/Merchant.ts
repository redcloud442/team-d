import { merchant_table } from "@prisma/client";
import { SupabaseClient } from "@supabase/supabase-js";

export const handleUpdateBalance = async (params: {
  amount: number;
  memberId: string;
}) => {
  const { amount, memberId } = params;
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/merchant/`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amount, memberId: memberId }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while updating the balance."
    );
  }

  return response;
};

export const getMerchantData = async (
  supabaseClient: SupabaseClient,
  params: {
    page: number;
    limit: number;
    teamMemberId: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc("get_merchant_data", {
    input_data: params,
  });

  if (error) {
    throw error;
  }

  return data as {
    data: merchant_table[];
    totalCount: number;
  };
};

export const handleCreateMerchantData = async (params: {
  accountNumber: string;
  accountType: string;
  accountName: string;
}) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/merchant/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while creating the merchant."
    );
  }

  return response;
};

export const handleUpdateMerchantData = async (params: {
  merchantId: string;
}) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/merchant/`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while updating the merchant."
    );
  }

  return response;
};
