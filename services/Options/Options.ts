import { getToken } from "@/utils/function";
import { merchant_table, user_table } from "@prisma/client";
import { SupabaseClient } from "@supabase/supabase-js";

export const getUserOptionsMerchant = async (
  supabaseClient: SupabaseClient,
  params: {
    page: number;
    limit: number;
    teamMemberId: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc(
    "get_user_options_merchant",
    {
      input_data: params,
    }
  );
  if (error) {
    throw error;
  }

  return data as user_table[];
};

export const getUserOptions = async (
  supabaseClient: SupabaseClient,
  params: {
    page: number;
    limit: number;
    teamMemberId: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc("get_user_options", {
    input_data: params,
  });
  if (error) {
    throw error;
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
