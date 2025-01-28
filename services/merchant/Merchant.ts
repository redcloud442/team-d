import { getToken } from "@/utils/function";
import { merchant_table } from "@prisma/client";
import { SupabaseClient } from "@supabase/supabase-js";

export const handleUpdateBalance = async (
  params: {
    amount: number;
    memberId: string;
  },
  supabaseClient: SupabaseClient
) => {
  const token = await getToken(supabaseClient);

  const response = await fetch(`/api/v1/merchant`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount: params.amount, memberId: params.memberId }),
  });

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
  const response = await fetch(`/api/merchant/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while creating the merchant."
    );
  }

  return response;
};

export const handleUpdateMerchantData = async (
  params: {
    merchantId: string;
  },
  supabaseClient: SupabaseClient
) => {
  const token = await getToken(supabaseClient);

  const response = await fetch(`/api/v1/merchant`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while updating the merchant."
    );
  }

  return response;
};
