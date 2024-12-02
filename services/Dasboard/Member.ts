import { ChartDataMember } from "@/utils/types";
import { SupabaseClient } from "@supabase/supabase-js";

export const getDashboard = async (
  supabaseClient: SupabaseClient,
  params: {
    teamMemberId: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc("get_dashboard_data", {
    input_data: params,
  });

  if (error) throw error;

  return data as ChartDataMember[];
};
