import { alliance_wheel_log_table, alliance_wheel_table } from "@prisma/client";
import { create } from "zustand";

interface userDailyTaskState {
  dailyTask: {
    wheelLog: alliance_wheel_log_table;
    dailyTask: alliance_wheel_table;
  };

  setDailyTask: (dailyTask: {
    wheelLog: alliance_wheel_log_table;
    dailyTask: alliance_wheel_table;
  }) => void;
}

export const useDailyTaskStore = create<userDailyTaskState>((set) => ({
  dailyTask: {
    wheelLog: {} as alliance_wheel_log_table,
    dailyTask: {} as alliance_wheel_table,
  },

  setDailyTask: (dailyTask) =>
    set(() => ({
      dailyTask: {
        wheelLog: dailyTask.wheelLog,
        dailyTask: dailyTask.dailyTask,
      },
    })),
}));
