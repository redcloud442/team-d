import { company_earnings_table } from "@/utils/types";
import { create } from "zustand";

interface userEarningsState {
  earnings: company_earnings_table | null;

  setEarnings: (earnings: company_earnings_table | null) => void;
}

export const useUserEarningsStore = create<userEarningsState>((set) => ({
  earnings: null,

  setEarnings: (earnings) =>
    set(() => ({
      earnings: earnings,
    })),
}));
