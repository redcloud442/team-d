import { company_transaction_table } from "@/utils/types";

export const getTransactionHistory = async (params: {
  limit: number;
  status: "EARNINGS" | "WITHDRAWAL" | "DEPOSIT" | "REFERRAL";
  page: number;
}) => {
  const response = await fetch(`/api/v1/transaction`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch transaction history");
  }
  const data = await response.json();

  return data as {
    transactionHistory: company_transaction_table[];
    totalTransactions: number;
  };
};
