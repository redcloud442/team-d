import { ChartDataMember, company_proof_table } from "@/utils/types";

export const getDashboard = async (params: { teamMemberId: string }) => {
  const response = await fetch(`/api/v1/package/list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while fetching the dashboard data."
    );
  }

  const { data } = result;

  return data as ChartDataMember[];
};

export const getProofOfEarningsVideo = async (params: {
  page: number;
  take: number;
}) => {
  const response = await fetch(
    `/api/v1/proof-of-earnings/video?page=${params.page}&take=${params.take}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while fetching the proof of earnings."
    );
  }

  return {
    data: result.data as company_proof_table[],
    total: result.total,
  };
};

export const getProofOfEarninggetsVideo = async () => {
  const response = await fetch(`/api/v1/proof-of-earnings`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while fetching the proof of earnings."
    );
  }

  return result.data as company_proof_table[];
};
