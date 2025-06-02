import { escapeFormData } from "@/utils/function";
import {
  adminUserReinvestedReportData,
  user_table,
  UserLog,
  UserRequestdata,
} from "@/utils/types";
import { SupabaseClient } from "@supabase/supabase-js";

export const getAdminUserRequest = async (params: {
  page: number;
  limit: number;
  search?: string;
  columnAccessor: string;
  isAscendingSort: boolean;
  userRole?: string;
  dateCreated?: string;
  bannedUser?: boolean;
}) => {
  const sanitizedData = escapeFormData(params);

  const response = await fetch(`/api/v1/user/list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sanitizedData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }

  return data as {
    data: UserRequestdata[];
    totalCount: number;
  };
};

export const getUserWithActiveBalance = async (params: {
  teamMemberId: string;
  page: number;
  limit: number;
  search?: string;
  columnAccessor: string;
  isAscendingSort: boolean;
}) => {
  const sanitizedData = escapeFormData(params);

  const response = await fetch(`/api/v1/user/active-list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sanitizedData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }

  return data as {
    data: (user_table & { company_member_id: string })[];
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

export const handleUpdateRole = async (params: {
  role: string;
  userId: string;
}) => {
  const sanitizedData = escapeFormData(params);

  const response = await fetch(`/api/v1/user/` + sanitizedData.userId, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "updateRole", role: sanitizedData.role }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while updating the role."
    );
  }

  return response;
};

export const handleUpdateUserRestriction = async (params: {
  userId: string;
  type: string;
}) => {
  const { userId, type } = params;
  const response = await fetch(`/api/v1/user/` + userId, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "banUser", type: type }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while banning the user."
    );
  }

  return response;
};

export const handleUpdateSuperVip = async (params: {
  userId: string;
  type: string;
}) => {
  const { userId, type } = params;
  const response = await fetch(`/api/v1/user/` + userId, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "updateVip", type: type }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while banning the user."
    );
  }

  return response;
};

export const getAdminUserReinvestedReport = async (params: {
  dateFilter: {
    start: Date | null;
    end: Date | null;
  };
  take: number;
  skip: number;
}) => {
  const response = await fetch("/api/v1/user/list/reinvested", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const result = await response.json();

  if (!response.ok) throw new Error("Failed to fetch withdrawal total report");

  return result as {
    data: adminUserReinvestedReportData[];
    totalCount: number;
  };
};

export const getUserByUsername = async (params: { username: string }) => {
  const response = await fetch(`/api/v1/user/search?search=${params.username}`);

  const result = await response.json();

  if (!response.ok) throw new Error("Failed to fetch user profile");

  return result as {
    data: UserRequestdata[];
  };
};

export const getAdminCheckUserReferral = async (params: {
  memberId: string;
  dateFilter: {
    start: Date | null;
    end: Date | null;
  };
}) => {
  const response = await fetch(`/api/v1/user/${params.memberId}/referral`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const result = await response.json();

  if (!response.ok) throw new Error("Failed to fetch referral data");

  return result as {
    directReferral: number;
    indirectReferral: number;
  };
};
