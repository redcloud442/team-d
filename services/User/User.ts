import {
  DashboardEarnings,
  HeirarchyData,
  company_earnings_table,
} from "@/utils/types";

export const getUserSponsor = async (params: { userId: string }) => {
  const response = await fetch(`/api/v1/user/sponsor`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while fetching the earnings."
    );
  }

  return result as string;
};

export const getUserEarnings = async (params: { memberId: string }) => {
  const response = await fetch(`/api/v1/user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
    userEarningsData: company_earnings_table;
  };
};

export const getUserWithdrawalToday = async () => {
  const response = await fetch(`/api/v1/user`, {
    method: "GET",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while fetching the withdrawal."
    );
  }

  return result as {
    totalEarnings: DashboardEarnings;
    userEarningsData: company_earnings_table;
    actions: {
      canWithdrawReferral: boolean;
      canUserDeposit: boolean;
      canWithdrawPackage: boolean;
    };
  };
};

export const changeUserPassword = async (params: {
  userId: string;
  email: string;
  password: string;
}) => {
  const response = await fetch(
    `/api/v1/user/` + params.userId + `/change-password`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while changing the password."
    );
  }

  return result;
};

export const updateUserProfile = async (params: {
  userId: string;
  profilePicture: string;
}) => {
  const response = await fetch(`/api/v1/user/` + params.userId, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
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

export const handleGenerateLink = async (params: {
  formattedUserName: string;
}) => {
  const response = await fetch(`/api/v1/user/generate-link`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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

export const getHeirarchy = async (params: { allianceMemberId: string }) => {
  const response = await fetch(`/api/v1/user/${params.allianceMemberId}/tree`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while fetching the heirarchy."
    );
  }

  return result as HeirarchyData[];
};

export const updateUserProfileInfo = async (params: {
  id: string;
  contactNo: string;
  gender: string;
}) => {
  const response = await fetch(
    `/api/v1/user/` + params.id + `/update-profile`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contactNo: params.contactNo,
        gender: params.gender,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "An error occurred while updating the profile."
    );
  }

  return result as {
    message: string;
    data: {
      user_phone_number: string;
      user_gender: string;
    };
  };
};
