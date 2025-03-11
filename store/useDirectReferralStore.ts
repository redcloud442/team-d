import { user_table } from "@prisma/client";
import { create } from "zustand";

interface directReferralState {
  directReferral: {
    data: (user_table & {
      total_bounty_earnings: string;
      package_ally_bounty_log_date_created: Date;
      alliance_referral_date: Date;
    })[];
    count: number;
  };

  setDirectReferral: (directReferral: {
    data: (user_table & {
      total_bounty_earnings: string;
      package_ally_bounty_log_date_created: Date;
      alliance_referral_date: Date;
    })[];
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
