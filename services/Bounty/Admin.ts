import { SupabaseClient } from "@supabase/supabase-js";

export const getTotalReferral = async (
  supabaseClient: SupabaseClient,
  params: {
    teamMemberId: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc("get_total_referral", {
    input_data: params,
  });

  if (error) throw error;

  return data as number;
};
