import { WithdrawalFormValues } from "@/components/DashboardPage/DashboardWithdrawRequest/DashboardWithdrawModal/DashboardWithdrawModalWithdraw";
import { getToken } from "@/utils/function";
import { WithdrawalRequestData } from "@/utils/types";
import { SupabaseClient } from "@supabase/supabase-js";

export const createWithdrawalRequest = async (
  params: {
    WithdrawFormValues: WithdrawalFormValues;
    teamMemberId: string;
  },
  supabaseClient: SupabaseClient
) => {
  const { WithdrawFormValues, teamMemberId } = params;

  const token = await getToken(supabaseClient);

  const data = {
    ...WithdrawFormValues,
    teamMemberId,
  };

  const response = await fetch(`/api/v1/withdraw`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while creating the top-up request."
    );
  }

  return result;
};

export const getMemberWithdrawalRequest = async (
  params: {
    page: number;
    limit: number;
    search?: string;
    columnAccessor: string;
    isAscendingSort: boolean;
    userId?: string;
  },
  supabaseClient: SupabaseClient
) => {
  const token = await getToken(supabaseClient);

  const response = await fetch(`/api/v1/withdraw/history`, {
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
      result.error || "An error occurred while fetching the withdrawal history."
    );
  }

  return result as {
    data: WithdrawalRequestData[];
    totalCount: 0;
  };
};
