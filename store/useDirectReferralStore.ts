import { user_table } from "@prisma/client";
import { create } from "zustand";

interface directReferralState {
  directReferral: {
    data: (user_table & { total_bounty_earnings: string })[];
    count: number;
  };

  setDirectReferral: (directReferral: {
    data: (user_table & { total_bounty_earnings: string })[];
    count: number;
  }) => void;
}

export const useDirectReferralStore = create<directReferralState>((set) => ({
  directReferral: {
    data: [],
    count: 0,
  },
  setDirectReferral: (directReferral) =>
    set(() => ({
      directReferral: {
        data: directReferral.data,
        count: directReferral.count,
      },
    })),
}));
