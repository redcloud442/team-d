import { company_promo_table } from "@/utils/types";

export const GetBanners = async () => {
  const res = await fetch("/api/v1/banner", {
    method: "GET",
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error("Failed to fetch banners");
  }

  return data as company_promo_table[];
};
