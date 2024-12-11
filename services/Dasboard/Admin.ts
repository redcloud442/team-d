import { ChartData } from "@/utils/types";
import { SupabaseClient } from "@supabase/supabase-js";

export const getAdminDashboard = async (
  supabaseClient: SupabaseClient,
  params: {
    dateFilter?: {
      start: string;
      end: string;
    };
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
    directLoot: 0;
    indirectLoot: 0;
    activePackageWithinTheDay: 0;
    numberOfRegisteredUser: 0;
    chartData: ChartData[];
  };
};

export const getLeaderBoardData = async (
  supabaseClient: SupabaseClient,
  params: {
    leaderBoardType: "DIRECT" | "INDIRECT";
    teamMemberId: string;
    limit: number;
    page: number;
  }
) => {
  const { data, error } = await supabaseClient.rpc("get_leaderboard_data", {
    input_data: params,
  });

  if (error) throw error;

  return data as {
    totalCount: 0;
    data: { username: string; totalAmount: number }[];
  };
};
