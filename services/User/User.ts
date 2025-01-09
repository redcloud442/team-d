import { alliance_earnings_table } from "@prisma/client";

export const getEarnings = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user`, {
    method: "GET",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while fetching the earnings."
    );
  }

  const { data } = result;

  return data as alliance_earnings_table;
};
