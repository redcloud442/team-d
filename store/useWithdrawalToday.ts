import { create } from "zustand";

interface userHaveAlreadyWithdraw {
  isWithdrawalToday: {
    referral: boolean;
    package: boolean;
    winning: boolean;
  };
  canUserDeposit: boolean;

  setIsWithdrawalToday: (value: {
    referral: boolean;
    package: boolean;
    winning: boolean;
  }) => void;
  setCanUserDeposit: (value: boolean) => void;
}

export const useUserHaveAlreadyWithdraw = create<userHaveAlreadyWithdraw>(
  (set) => ({
    isWithdrawalToday: {
      referral: false,
      package: false,
      winning: false,
    },
    canUserDeposit: false,

    setIsWithdrawalToday: (isWithdrawalToday) =>
      set(() => ({
        isWithdrawalToday: {
          referral: isWithdrawalToday.referral,
          package: isWithdrawalToday.package,
          winning: isWithdrawalToday.winning,
        },
      })),
    setCanUserDeposit: (canUserDeposit) =>
      set(() => ({
        canUserDeposit: canUserDeposit,
      })),
  })
);
