import { TopUpRequestData } from "@/utils/types";
import { SupabaseClient } from "@supabase/supabase-js";

export const getAdminTopUpRequest = async (
  supabaseClient: SupabaseClient,
  params: {
    page: number;
    limit: number;
    search?: string;
    teamMemberId: string;
    teamId: string;
    columnAccessor: string;
    isAscendingSort: boolean;
  }
) => {
  const { data, error } = await supabaseClient.rpc("get_admin_top_up_history", {
    input_data: params,
  });

  if (error) throw error;

  return data as {
    data: TopUpRequestData[];
    totalCount: 0;
  };
};

export const updateTopUpStatus = async (params: {
  status: string;
  requestId: string;
}) => {
  const { requestId } = params;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/top-up/` + requestId,
    {
      method: "PUT",
      body: JSON.stringify(params),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while creating the top-up request."
    );
  }

  return response;
};
