export const createPackageConnection = async (params: {
  packageData: { amount: number; packageId: string };
  teamMemberId: string;
}) => {
  const { packageData, teamMemberId } = params;

  const inputData = {
    ...packageData,
    teamMemberId,
  };

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/package/`,
    {
      method: "POST",
      body: JSON.stringify(inputData),
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
