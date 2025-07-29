import { WithdrawalFormValues } from "@/utils/schema";
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
      result.message ||
        "An error occurred while creating the withdrawal request."
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

export const hideAllWithdrawalRequest = async (params: {
  take: number;
  skip: number;
}) => {
  const response = await fetch(`/api/v1/withdraw/hide-all`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while hiding the withdrawal request."
    );
  }

  return result as {
    message: string;
    count: number;
  };
};
