import { getToken } from "@/utils/function";
import { DashboardEarnings } from "@/utils/types";
import { alliance_earnings_table } from "@prisma/client";
import { SupabaseClient } from "@supabase/supabase-js";

export const getUserSponsor = async (
  params: { userId: string },
  supabaseClient: SupabaseClient
) => {
  const token = await getToken(supabaseClient);

  const response = await fetch(`/api/v1/user/sponsor`, {
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
      result.error || "An error occurred while fetching the earnings."
    );
  }

  const { data } = result;

  return data as {
    user_username: string;
  };
};

export const getUserEarnings = async (
  params: { memberId: string },
  supabaseClient: SupabaseClient
) => {
  const token = await getToken(supabaseClient);

  const response = await fetch(`/api/v1/user`, {
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
      result.error || "An error occurred while fetching the earnings."
    );
  }

  return result as {
    totalEarnings: DashboardEarnings;
    userEarningsData: alliance_earnings_table;
  };
};

export const getUserWithdrawalToday = async (
  supabaseClient: SupabaseClient
) => {
  const token = await getToken(supabaseClient);

  const response = await fetch(`/api/v1/user`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while fetching the withdrawal."
    );
  }

  const { isWithdrawalToday } = result;

  return isWithdrawalToday;
};

export const changeUserPassword = async (
  params: {
    userId: string;
    email: string;
    password: string;
  },
  supabaseClient: SupabaseClient
) => {
  const token = await getToken(supabaseClient);

  const response = await fetch(`/api/v1/user`, {
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
      result.error || "An error occurred while changing the password."
    );
  }

  return result;
};

export const updateUserProfile = async (
  params: {
    userId: string;
    profilePicture: string;
  },
  supabaseClient: SupabaseClient
) => {
  const token = await getToken(supabaseClient);

  const response = await fetch(`/api/v1/user/` + params.userId, {
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
      result.error || "An error occurred while updating the profile."
    );
  }

  return result;
};

export const handleGenerateLink = async (
  params: {
    formattedUserName: string;
  },
  supabaseClient: SupabaseClient
) => {
  const token = await getToken(supabaseClient);

  const response = await fetch(`/api/v1/user/generate-link`, {
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
      result.error || "An error occurred while generating the link."
    );
  }

  return result;
};
