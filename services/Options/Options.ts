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

export const getMerchantOptions = async (
  supabaseClient: SupabaseClient,
  params: {
    teamMemberId: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc("get_merchant_option", {
    input_data: params,
  });
  if (error) {
    throw error;
  }

  return data as merchant_table[];
};
