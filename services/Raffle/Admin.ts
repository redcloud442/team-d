import {
  alliance_promo_banner_table,
  alliance_promo_table,
} from "@prisma/client";

export const getAdminRaffle = async () => {
  const response = await fetch(`/api/v1/raffle`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while creating the top-up request."
    );
  }

  return result as alliance_promo_table[];
};

export const createAdminRaffle = async (params: {
  raffleTitle: string;
  raffleDescription: string;
  currentSlot: number;
  maximumSlot: number;
}) => {
  const response = await fetch(`/api/v1/raffle`, {
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

  return result as alliance_promo_table[];
};

export const updateAdminRaffle = async (params: {
  raffleId: string;
  raffleTitle: string;
  raffleDescription: string;
  currentSlot: number;
  maximumSlot: number;
  isDisabled: boolean;
}) => {
  const response = await fetch(`/api/v1/raffle/${params.raffleId}`, {
    method: "PUT",
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

  return result as alliance_promo_table[];
};

export const createRaffleBanner = async (params: { bannerImage: string }) => {
  const response = await fetch(`/api/v1/raffle/banner`, {
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

  return result as alliance_promo_banner_table[];
};

export const deleteRaffleBanner = async (params: { bannerId: string }) => {
  const response = await fetch(`/api/v1/raffle/banner/${params.bannerId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "An error occurred while creating the top-up request."
    );
  }

  return result as alliance_promo_banner_table[];
};
