import { alliance_earnings_table } from "@prisma/client";
import { create } from "zustand";

interface userEarningsState {
  earnings: alliance_earnings_table | null;

  setEarnings: (earnings: alliance_earnings_table | null) => void;
}

export const useUserEarningsStore = create<userEarningsState>((set) => ({
  earnings: null,

  setEarnings: (earnings) =>
    set(() => ({
      earnings: earnings,
    })),
}));
