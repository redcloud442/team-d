import { LegionRequestData } from "@/utils/types";
import { create } from "zustand";

interface indirectReferralState {
  indirectReferral: {
    data: LegionRequestData[];
    count: number;
  };

  setIndirectReferral: (indirectReferral: {
    data: LegionRequestData[];
    count: number;
  }) => void;
}

export const useIndirectReferralStore = create<indirectReferralState>(
  (set) => ({
    indirectReferral: {
      data: [],
      count: 0,
    },
    setIndirectReferral: (indirectReferral) =>
      set(() => ({
        indirectReferral: {
          data: indirectReferral.data,
          count: indirectReferral.count,
        },
      })),
  })
);
