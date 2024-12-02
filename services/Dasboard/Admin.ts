import { ChartData } from "@/utils/types";
import { SupabaseClient } from "@supabase/supabase-js";

export const getAdminDashboard = async (
  supabaseClient: SupabaseClient,
  params: {
    dateFilter?: string;
    teamMemberId: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc("get_admin_dashboard_data", {
    input_data: params,
  });

  if (error) throw error;

  return data as {
    totalEarnings: 0;
    totalWithdraw: 0;
    totalLoot: 0;
    chartData: ChartData[];
  };
};
