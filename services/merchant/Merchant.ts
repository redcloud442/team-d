import { getToken } from "@/utils/function";
import { merchant_balance_log, merchant_table } from "@prisma/client";
import { SupabaseClient } from "@supabase/supabase-js";

export const handleUpdateBalance = async (
  params: {
    amount: number;
    memberId: string;
    userName: string;
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
    body: JSON.stringify(params),
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
  }
) => {
  const token = await getToken(supabaseClient);

  const response = await fetch(`/api/v1/merchant/bank`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error("Failed to fetch merchant data");
  }

  const { data } = responseData;

  return data as {
    data: merchant_table[];
    totalCount: number;
  };
};

export const handleCreateMerchantData = async (
  params: {
    accountNumber: string;
    accountType: string;
    accountName: string;
  },
  supabaseClient: SupabaseClient
) => {
  const token = await getToken(supabaseClient);
  const response = await fetch(`/api/v1/merchant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error("An error occurred while creating the merchant.");
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

export const getMerchantBalanceHistory = async (
  params: {
    page: number;
    limit: number;
  },
  supabaseClient: SupabaseClient
) => {
  const token = await getToken(supabaseClient);

  const response = await fetch(`/api/v1/merchant/balance-history`, {
    method: "POST",
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

  return result as {
    data: merchant_balance_log[];
    totalCount: number;
  };
};
