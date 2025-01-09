import { AdminDashboardData, AdminDashboardDataByDate } from "@/utils/types";
import { SupabaseClient } from "@supabase/supabase-js";

export const getAdminDashboardByDate = async (
  supabaseClient: SupabaseClient,
  params: {
    dateFilter?: {
      start: string;
      end: string;
    };
    teamMemberId: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc(
    "get_admin_dashboard_data_by_date",
    {
      input_data: params,
    }
  );

  if (error) throw error;

  return data as AdminDashboardDataByDate;
};

export const getAdminDashboard = async (
  supabaseClient: SupabaseClient,
  params: {
    teamMemberId: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc("get_admin_dashboard_data", {
    input_data: params,
  });

  if (error) throw error;

  return data as AdminDashboardData;
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
