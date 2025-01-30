import { getToken } from "@/utils/function";
import { AdminWithdrawaldata } from "@/utils/types";
import { SupabaseClient } from "@supabase/supabase-js";

export const getAdminWithdrawalRequest = async (
  supabaseClient: SupabaseClient,
  params: {
    page: number;
    limit: number;
    search?: string;
    columnAccessor: string;
    isAscendingSort: boolean;
    userFilter?: string;
    statusFilter?: string;
    dateFilter?: {
      start: string | undefined;
      end: string | undefined;
    };
  }
) => {
  const token = await getToken(supabaseClient);

  const response = await fetch("/api/v1/withdraw/list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  const result = await response.json();

  if (!response.ok) throw new Error("Failed to fetch withdrawal list");

  return result as AdminWithdrawaldata;
};

export const updateWithdrawalStatus = async (
  params: {
    status: string;
    requestId: string;
    note?: string;
  },
  supabaseClient: SupabaseClient
) => {
  const { requestId } = params;
  const token = await getToken(supabaseClient);

  const response = await fetch(`/api/v1/withdraw/` + requestId, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while creating the top-up request."
    );
  }

  return response;
};
