export const handleUpdateBalance = async (params: {
  amount: number;
  memberId: string;
}) => {
  const { amount, memberId } = params;
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/merchant/`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amount, memberId: memberId }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while updating the balance."
    );
  }

  return response;
};
