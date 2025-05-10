import {
  AdminWithdrawaldata,
  AdminWithdrawalReportData,
  WithdrawListExportData,
} from "@/utils/types";

export const getAdminWithdrawalRequest = async (params: {
  page: number;
  limit: number;
  search?: string;
  columnAccessor: string;
  isAscendingSort: boolean;
  userFilter?: string;
  statusFilter?: string;
  dateFilter?: {
    start: string | undefined;
    end: string | undefined;
  };
  showHiddenUser: boolean;
  showAllDays: boolean;
}) => {
  const response = await fetch("/api/v1/withdraw/list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const result = await response.json();

  if (!response.ok) throw new Error("Failed to fetch withdrawal list");

  return result as AdminWithdrawaldata;
};

export const updateWithdrawalStatus = async (params: {
  status: string;
  requestId: string;
  note?: string;
}) => {
  const { requestId } = params;

  const response = await fetch(`/api/v1/withdraw/` + requestId, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while creating the top-up request."
    );
  }

  return response;
};

export const getAdminWithdrawalReport = async (params: {
  dateFilter: {
    startDate: string;
    endDate: string;
  };
}) => {
  const response = await fetch("/api/v1/withdraw/report", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const result = await response.json();

  if (!response.ok) throw new Error("Failed to fetch withdrawal report");

  return result as AdminWithdrawalReportData;
};

export const getAdminWithdrawalTotalReport = async (params: {
  type: string;
  take: number;
  skip: number;
}) => {
  const response = await fetch("/api/v1/withdraw/total-report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const result = await response.json();

  if (!response.ok) throw new Error("Failed to fetch withdrawal total report");

  return result;
};

export const hideUser = async (params: {
  id: string;
  type: "add" | "remove";
}) => {
  const response = await fetch("/api/v1/withdraw/" + params.id + "/hide-user", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type: params.type }),
  });

  const result = await response.json();

  if (!response.ok) throw new Error("Failed to hide user");

  return result;
};

export const getAdminWithdrawalExport = async (params: {
  type: string;
  dateFilter: {
    start: string;
    end: string;
  };
  page: number;
  limit: number;
}) => {
  const response = await fetch("/api/v1/withdraw/list/export", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const result = await response.json();

  if (!response.ok) throw new Error("Failed to fetch withdrawal export");

  return result as {
    data: WithdrawListExportData[];
    totalCount: number;
  };
};
