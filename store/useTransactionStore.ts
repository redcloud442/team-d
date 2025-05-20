import { company_transaction_table } from "@/utils/types";
import { create } from "zustand";

interface userTransactionHistoryState {
  transactionHistory: {
    data: company_transaction_table[];
    count: number;
  };

  setTransactionHistory: (transactionHistory: {
    data: company_transaction_table[];
    count: number;
  }) => void;

  setAddTransactionHistory: (transactionHistory: {
    data: company_transaction_table[];
    count: number;
  }) => void;
}

export const useUserTransactionHistoryStore =
  create<userTransactionHistoryState>((set) => ({
    transactionHistory: {
      data: [],
      count: 0,
    },
    setTransactionHistory: (transactionHistory) =>
      set(() => ({
        transactionHistory: {
          data: transactionHistory.data,
          count: transactionHistory.count,
        },
      })),

    setAddTransactionHistory: (transactionHistory) =>
      set((state) => ({
        transactionHistory: {
          data: [...transactionHistory.data, ...state.transactionHistory.data],
          count: transactionHistory.count + 1,
        },
      })),
  }));
