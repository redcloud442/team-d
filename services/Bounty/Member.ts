import { LegionRequestData } from "@/utils/types";
import { user_table } from "@prisma/client";
import { SupabaseClient } from "@supabase/supabase-js";

export const getAllyBounty = async (
  supabaseClient: SupabaseClient,
  params: {
    page: number;
    limit: number;
    search?: string;
    teamMemberId: string;
    columnAccessor: string;
    isAscendingSort: boolean;
  }
) => {
  const { data, error } = await supabaseClient.rpc("get_ally_bounty", {
    input_data: params,
  });

  if (error) throw error;

  return data as {
    data: user_table[];
    totalCount: 0;
  };
};

export const getLegionBounty = async (
  supabaseClient: SupabaseClient,
  params: {
    page: number;
    limit: number;
    search?: string;
    teamMemberId: string;
    columnAccessor: string;
    isAscendingSort: boolean;
  }
) => {
  const { data, error } = await supabaseClient.rpc("get_legion_bounty", {
    input_data: params,
  });

  if (error) throw error;

  return data as {
    data: LegionRequestData[];
    totalCount: 0;
  };
};
