import { package_table } from "@/utils/types";

export const getAdminPackages = async () => {
  const response = await fetch(`/api/v1/package/get-all/list`, {
    method: "GET",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while creating the top-up request."
    );
  }

  const { data } = result;

  return data as package_table[];
};

// export const updatePackagesData = async (params: {
//   packageData: PackagesFormValues;
//   packageId: string;
//   teamMemberId: string;
// }) => {
//   const { packageId } = params;

//   const response = await fetch(`/api/v1/package/` + packageId, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(params),
//   });

//   const result = await response.json();

//   if (!response.ok) {
//     throw new Error(
//       result.error || "An error occurred while creating the top-up request."
//     );
//   }

//   const { data } = result;

//   return data;
// };

export const createPackage = async (params: {
  packageName: string;
  packageDescription: string;
  packagePercentage: string;
  packageDays: string;
  packageImage: string;
  packageColor: string;
}) => {
  const response = await fetch(`/api/v1/package/create`, {
    method: "POST",
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

  const { data } = result;

  return data;
};
