import { TopUpFormValues } from "@/components/DashboardPage/DashboardDepositRequest/DashboardDepositModal/DashboardDepositModalDeposit";
import { getToken } from "@/utils/function";
import { TopUpRequestData } from "@/utils/types";
import { SupabaseClient } from "@supabase/supabase-js";

export const getMemberTopUpRequest = async (
  params: {
    page: number;
    limit: number;
    search?: string;
    columnAccessor: string;
    isAscendingSort: boolean;
    teamMemberId?: string;
    userId?: string;
  },
  supabaseClient: SupabaseClient
) => {
  const token = await getToken(supabaseClient);

  const response = await fetch(`/api/v1/deposit/history`, {
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
      result.error || "An error occurred while fetching the top-up history."
    );
  }

  return result as {
    data: TopUpRequestData[];
    totalCount: 0;
  };
};

export const updateTopUpStatus = async (params: {
  status: string;
  requestId: string;
}) => {
  const { requestId } = params;

  const response = await fetch(`/api/top-up/` + requestId, {
    method: "PUT",
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

export const handleDepositRequest = async (
  params: {
    TopUpFormValues: TopUpFormValues;
    publicUrl: string;
  },
  supabaseClient: SupabaseClient
) => {
  const token = await getToken(supabaseClient);

  const response = await fetch(`/api/v1/deposit`, {
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
      result.error || "An error occurred while creating the top-up request."
    );
  }

  return response;
};
