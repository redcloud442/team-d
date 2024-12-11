import { alliance_earnings_table } from "@prisma/client";
import { SupabaseClient } from "@supabase/supabase-js";

export const getEarnings = async (
  supabase: SupabaseClient,
  params: {
    teamMemberId: string;
  }
) => {
  const { data, error } = await supabase.rpc("get_earnings_modal_data", {
    input_data: params,
  });
  if (error) throw error;
  return data as alliance_earnings_table;
};
