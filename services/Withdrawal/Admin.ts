import { WithdrawalRequestData } from "@/utils/types";
import { SupabaseClient } from "@supabase/supabase-js";

export const getAdminWithdrawalRequest = async (
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
  const { data, error } = await supabaseClient.rpc(
    "get_admin_withdrawal_history",
    {
      input_data: params,
    }
  );

  if (error) throw error;

  return data as {
    data: WithdrawalRequestData[];
    totalCount: 0;
  };
};
