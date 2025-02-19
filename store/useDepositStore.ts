import { create } from "zustand";

interface depositState {
  deposit: boolean;

  setDeposit: (deposit: boolean) => void;
}

export const useDepositStore = create<depositState>((set) => ({
  deposit: false,
  setDeposit: (deposit) => set(() => ({ deposit })),
}));
