import { user_table } from "@/utils/types";
import { create } from "zustand";

interface directReferralState {
  directReferral: {
    data: (user_table & {
      total_bounty_earnings: string;
      package_ally_bounty_log_date_created: Date;
      company_referral_date: Date;
    })[];
    count: number;
    lastFetchedAt: number;
  };

  setDirectReferral: (directReferral: {
    data: (user_table & {
      total_bounty_earnings: string;
      package_ally_bounty_log_date_created: Date;
      company_referral_date: Date;
    })[];
    count: number;
  }) => void;
}

export const useDirectReferralStore = create<directReferralState>((set) => ({
  directReferral: {
    data: [],
    count: 0,
    lastFetchedAt: 0,
  },
  setDirectReferral: (directReferral) =>
    set(() => ({
      directReferral: {
        data: directReferral.data,
        count: directReferral.count,
        lastFetchedAt: Date.now(),
      },
    })),
}));
