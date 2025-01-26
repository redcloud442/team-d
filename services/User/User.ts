import { DashboardEarnings } from "@/utils/types";
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

export const getUserSponsor = async (params: { userId: string }) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/sponsor`,
    {
      method: "POST",
      body: JSON.stringify(params),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while fetching the earnings."
    );
  }

  const { data } = result;

  return data as {
    user_username: string;
  };
};

export const getReferralData = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/referrals`,
      {
        method: "GET",
      }
    );

    const result = await response.json();

    return result as {
      direct: {
        sum: number;
        count: number;
      };
      indirect: {
        sum: number;
        count: number;
      };
    };
  } catch (e) {
    return { error: "Internal server error" };
  }
};

export const getUserEarnings = async (params: { memberId: string }) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while fetching the earnings."
    );
  }

  return result as {
    totalEarnings: DashboardEarnings;
    userEarningsData: alliance_earnings_table;
  };
};

export const getUserWithdrawalToday = async (params: { userId: string }) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/${params.userId}`,
    {
      method: "GET",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while fetching the withdrawal."
    );
  }

  const { isWithdrawalToday } = result;

  return isWithdrawalToday;
};
