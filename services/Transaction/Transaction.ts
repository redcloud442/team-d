import { getToken } from "@/utils/function";
import { alliance_transaction_table } from "@prisma/client";
import { SupabaseClient } from "@supabase/supabase-js";

export const getTransactionHistory = async (
  params: {
    limit: number;
    page: number;
  },
  supabaseClient: SupabaseClient
) => {
  const token = await getToken(supabaseClient);

  const response = await fetch(`/api/v1/transaction`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch transaction history");
  }
  const data = await response.json();

  return data as {
    transactionHistory: alliance_transaction_table[];
    totalTransactions: number;
  };
};
