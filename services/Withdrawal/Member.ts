import { WithdrawalFormValues } from "@/components/DashboardPage/DashboardWithdrawRequest/DashboardWithdrawModal/DashboardWithdrawModalWithdraw";
import { WithdrawalRequestData } from "@/utils/types";

export const createWithdrawalRequest = async (params: {
  WithdrawFormValues: WithdrawalFormValues;
  teamMemberId: string;
}) => {
  const { WithdrawFormValues } = params;

  const data = {
    ...WithdrawFormValues,
  };

  const response = await fetch(`/api/v1/withdraw`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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

export const getMemberWithdrawalRequest = async (params: {
  page: number;
  limit: number;
  search?: string;
  columnAccessor: string;
  isAscendingSort: boolean;
  userId?: string;
}) => {
  const response = await fetch(`/api/v1/withdraw/history`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
