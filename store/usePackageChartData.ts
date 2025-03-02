import { ChartDataMember } from "@/utils/types";
import { create } from "zustand";

interface packageChartDataState {
  chartData: ChartDataMember[];
  setChartData: (chartData: ChartDataMember[]) => void;
}

export const usePackageChartData = create<packageChartDataState>((set) => ({
  chartData: [],

  setChartData: (chartData) =>
    set(() => ({
      chartData: chartData,
    })),
}));
