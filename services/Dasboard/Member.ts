import { getToken } from "@/utils/function";
import { ChartDataMember } from "@/utils/types";
import { SupabaseClient } from "@supabase/supabase-js";

export const getDashboard = async (
  supabaseClient: SupabaseClient,
  params: {
    teamMemberId: string;
  }
) => {
  const token = await getToken(supabaseClient);

  const response = await fetch(`/api/v1/package/list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while fetching the dashboard data."
    );
  }

  const { data } = result;

  return data as ChartDataMember[];
};
