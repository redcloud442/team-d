import { getToken } from "@/utils/function";
import { SupabaseClient } from "@supabase/supabase-js";

export const getTotalReferral = async (supabaseClient: SupabaseClient) => {
  const token = await getToken(supabaseClient);

  const response = await fetch(`/api/v1/referral`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error("Failed to fetch total referral");
  }

  const { data } = responseData;

  return data as number;
};
