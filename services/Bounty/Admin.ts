export const getTotalReferral = async () => {
  const response = await fetch(`/api/v1/referral`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error("Failed to fetch total referral");
  }

  const { data } = responseData;

  return data as number;
};
