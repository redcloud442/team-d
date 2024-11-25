import { UserRequestdata } from "@/utils/types";
import { SupabaseClient } from "@supabase/supabase-js";

export const getAdminUserRequest = async (
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
  const { data, error } = await supabaseClient.rpc("get_admin_user_data", {
    input_data: params,
  });

  if (error) throw error;

  return data as {
    data: UserRequestdata[];
    totalCount: 0;
  };
};
