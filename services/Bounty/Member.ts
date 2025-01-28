import { getToken } from "@/utils/function";
import { LegionRequestData } from "@/utils/types";
import { user_table } from "@prisma/client";
import { SupabaseClient } from "@supabase/supabase-js";

export const getAllyBounty = async (
  params: {
    page: number;
    limit: number;
    search?: string;
    teamMemberId: string;
    columnAccessor: string;
    isAscendingSort: boolean;
  },
  supabaseClient: SupabaseClient
) => {
  const token = await getToken(supabaseClient);

  const urlParams = {
    page: params.page.toString(),
    limit: params.limit.toString(),
    search: params.search || "",
    columnAccessor: params.columnAccessor,
    isAscendingSort: params.isAscendingSort.toString(),
    teamMemberId: params.teamMemberId,
  };

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/referral/direct`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(urlParams),
    }
  );

  const result = await response.json();

  if (!response.ok) throw new Error(result.error);

  return result as {
    data: (user_table & { total_bounty_earnings: string })[];
    totalCount: 0;
  };
};

export const getLegionBounty = async (
  params: {
    page: number;
    limit: number;
    search?: string;
    teamMemberId: string;
    columnAccessor: string;
    isAscendingSort: boolean;
  },
  supabaseClient: SupabaseClient
) => {
  const token = await getToken(supabaseClient);

  const urlParams = {
    page: params.page.toString(),
    limit: params.limit.toString(),
    search: params.search || "",
    columnAccessor: params.columnAccessor,
    isAscendingSort: params.isAscendingSort.toString(),
  };

  const response = await fetch(`/api/v1/referral/indirect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(urlParams),
  });

  const result = await response.json();

  if (!response.ok) throw new Error(result.error);

  return result as {
    data: LegionRequestData[];
    totalCount: 0;
  };
};
