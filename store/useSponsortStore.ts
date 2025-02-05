import { create } from "zustand";

interface userLoadingState {
  sponsor: string;

  setSponsor: (sponsor: string) => void;
}

export const useSponsorStore = create<userLoadingState>((set) => ({
  sponsor: "",

  setSponsor: (sponsor) =>
    set(() => ({
      sponsor: sponsor,
    })),
}));
