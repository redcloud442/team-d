import { TopUpFormValues } from "@/components/TopUpPage/TopUpPage";

export const createTopUpRequest = async (params: {
  TopUpFormValues: TopUpFormValues;
  teamMemberId: string;
  bucket?: string;
}) => {
  const { TopUpFormValues, teamMemberId } = params;

  const formData = new FormData();
  formData.append("amount", TopUpFormValues.amount);
  formData.append("topUpMode", TopUpFormValues.topUpMode);
  formData.append("accountName", TopUpFormValues.accountName);
  formData.append("accountNumber", TopUpFormValues.accountNumber);

  if (TopUpFormValues.file instanceof File) {
    formData.append("file", TopUpFormValues.file, TopUpFormValues.file.name);
  }

  formData.append("teamMemberId", teamMemberId);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/top-up`,
    {
      method: "POST",
      body: formData,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while creating the top-up request."
    );
  }

  return result;
};
