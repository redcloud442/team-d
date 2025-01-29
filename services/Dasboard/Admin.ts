import { getToken } from "@/utils/function";
import { AdminDashboardData, AdminDashboardDataByDate } from "@/utils/types";
import { SupabaseClient } from "@supabase/supabase-js";

export const getAdminDashboardByDate = async (
  supabaseClient: SupabaseClient,
  params: {
    dateFilter?: {
      start: string;
      end: string;
    };
  }
) => {
  const token = await getToken(supabaseClient);

  const response = await fetch(`/api/v1/dashboard`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error("Failed to fetch admin dashboard by date");
  }

  return responseData as AdminDashboardDataByDate;
};

export const getAdminDashboard = async (supabaseClient: SupabaseClient) => {
  const token = await getToken(supabaseClient);

  const response = await fetch(`/api/v1/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Failed to fetch admin dashboard");
  }

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
  const token = await getToken(supabaseClient);

  const response = await fetch(`/api/v1/leaderboard`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Failed to fetch leaderboard data");
  }

  return data as {
    totalCount: number;
    data: { username: string; totalAmount: number }[];
  };
};
