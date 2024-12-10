import { package_table } from "@prisma/client";
import { SupabaseClient } from "@supabase/supabase-js";

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

export const getPackageModalData = async (
  supabaseClient: SupabaseClient,
  params: {
    teamMemberId: string;
  }
) => {
  const { data, error } = await supabaseClient.rpc("get_package_modal_data", {
    input_data: params,
  });

  if (error) throw error;

  return data as package_table[];
};
