import { Line } from "recharts";

import { CartesianGrid, LineChart as LineChartRecharts, XAxis } from "recharts";
import { ChartConfig, ChartContainer } from "./chart";

import { ChartTooltipContent } from "./chart";

import { ChartTooltip } from "./chart";

type ChartPoint = {
  time: string;
  value: number;
};

type LineChartProps = {
  data: ChartPoint[];
};

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const LineChart = ({ data }: LineChartProps) => {
  return (
    <ChartContainer config={chartConfig}>
      <LineChartRecharts
        accessibilityLayer
        data={data}
        margin={{ left: 12, right: 12 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="time"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Line
          dataKey="value"
          type="monotone"
          stroke="var(--color-desktop)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={true}
        />
      </LineChartRecharts>
    </ChartContainer>
  );
};

export default LineChart;
