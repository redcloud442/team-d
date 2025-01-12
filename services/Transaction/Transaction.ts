import { alliance_transaction_table } from "@prisma/client";

export const getTransactionHistory = async (params: {
  limit: number;
  page: number;
}) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/transaction`,
    {
      method: "POST",
      body: JSON.stringify(params),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch transaction history");
  }
  const data = await response.json();

  return data as {
    transactionHistory: alliance_transaction_table[];
    totalTransactions: number;
  };
};
