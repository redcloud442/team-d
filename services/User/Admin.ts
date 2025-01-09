import { escapeFormData } from "@/utils/function";
import { UserLog, UserRequestdata } from "@/utils/types";
import { user_table } from "@prisma/client";
import { SupabaseClient } from "@supabase/supabase-js";
import { loginValidation } from "../auth/auth";

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
    userRole?: string;
    dateCreated?: string;
  }
) => {
  const sanitizedData = escapeFormData(params);

  const { data, error } = await supabaseClient.rpc("get_admin_user_data", {
    input_data: sanitizedData,
  });

  if (error) throw error;

  return data as {
    data: UserRequestdata[];
    totalCount: 0;
  };
};

export const getUserWithActiveBalance = async (
  supabaseClient: SupabaseClient,
  params: {
    teamMemberId: string;
    page: number;
    limit: number;
    search?: string;
    columnAccessor: string;
    isAscendingSort: boolean;
  }
) => {
  const sanitizedData = escapeFormData(params);

  const { data, error } = await supabaseClient.rpc(
    "get_user_with_active_balance",
    {
      input_data: sanitizedData,
    }
  );

  if (error) throw error;

  return data as {
    data: user_table[];
    totalCount: 0;
  };
};

export const getHistoryLog = async (
  supabaseClient: SupabaseClient,
  params: {
    page: number;
    limit: number;
    teamMemberId: string;
    columnAccessor: string;
    isAscendingSort: boolean;
  }
) => {
  const sanitizedData = escapeFormData(params);

  const { data, error } = await supabaseClient.rpc("get_history_log", {
    input_data: sanitizedData,
  });

  if (error) throw error;

  return data as {
    data: UserLog[];
    totalCount: 0;
  };
};

export const handleSignInUser = async (
  supabaseClient: SupabaseClient,
  params: {
    userName: string;
    password: string;
    role: string;
    iv: string;
  }
) => {
  const sanitizedData = escapeFormData(params);

  const response = await loginValidation(supabaseClient, {
    userName: sanitizedData.userName,
    password: sanitizedData.password,
    role: sanitizedData.role,
    iv: sanitizedData.iv,
  });
  return response;
};

export const handleUpdateRole = async (params: {
  role: string;
  userId: string;
}) => {
  const sanitizedData = escapeFormData(params);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/` + sanitizedData.userId,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateRole", role: sanitizedData.role }),
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

export const handleUpdateUserRestriction = async (params: {
  userId: string;
}) => {
  const { userId } = params;
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/` + userId,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "banUser" }),
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
