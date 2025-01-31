import { getToken } from "@/utils/function";
import { merchant_table, user_table } from "@prisma/client";
import { SupabaseClient } from "@supabase/supabase-js";

export const getUserOptionsMerchant = async (
  supabaseClient: SupabaseClient,
  params: {
    page: number;
    limit: number;
  }
) => {
  const token = await getToken(supabaseClient);

  const response = await fetch(`/api/v1/options/merchant-options`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Failed to fetch user options");
  }

  return data as user_table[];
};

export const getUserOptions = async (
  supabaseClient: SupabaseClient,
  params: {
    page: number;
    limit: number;
  }
) => {
  const token = await getToken(supabaseClient);

  const response = await fetch(`/api/v1/options/user-options`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Failed to fetch user options");
  }

  return data as user_table[];
};

export const getMerchantOptions = async (supabaseClient: SupabaseClient) => {
  const token = await getToken(supabaseClient);

  const response = await fetch(`/api/v1/merchant`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch merchant options");
  }

  const result = await response.json();

  const { data } = result;

  return data as merchant_table[];
};
