import { PackagesFormValues } from "@/components/AdminPackagesPage/EditPackagesModal";
import { getToken } from "@/utils/function";
import { package_table } from "@prisma/client";
import { SupabaseClient } from "@supabase/supabase-js";

export const getAdminPackages = async (supabaseClient: SupabaseClient) => {
  const token = await getToken(supabaseClient);

  const response = await fetch(`/api/v1/package/list`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
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

export const updatePackagesData = async (
  params: {
    packageData: PackagesFormValues;
    packageId: string;
    teamMemberId: string;
  },
  supabaseClient: SupabaseClient
) => {
  const token = await getToken(supabaseClient);

  const { packageId } = params;

  const response = await fetch(`/api/v1/package/` + packageId, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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

export const createPackage = async (
  params: {
    packageName: string;
    packageDescription: string;
    packagePercentage: string;
    packageDays: string;
    packageImage: string;
    packageColor: string;
  },
  supabaseClient: SupabaseClient
) => {
  const token = await getToken(supabaseClient);

  const response = await fetch(`/api/v1/package/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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
