"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { ChartDataMember } from "@/utils/types";

type Props = {
  chartData: ChartDataMember[];
};

const chartData = [
  {
    package: "Package 1",
    completion: 75,
    completion_date: "2024-12-01",
    amount: 1500,
  },
  {
    package: "Package 2",
    completion: 50,
    completion_date: "2024-12-15",
    amount: 2300,
  },
  {
    package: "Package 3",
    completion: 90,
    completion_date: "2024-12-31",
    amount: 1800,
  },
];

const chartConfig = {
  completion: {
    label: "Completion (%)",
    color: "hsl(var(--chart-1))",
  },
  completion_date: {
    label: "Date Completed",
    color: "hsl(var(--chart-1))",
  },
  amount: {
    label: "Peso",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 shadow-lg border rounded-md">
        <p className="text-sm font-bold">{data.package}</p>
        <p className="text-sm">Completion: {data.completion}%</p>
        <p className="text-sm">Amount: ₱{data.amount.toLocaleString()}</p>
        <p className="text-sm">Completion Date: {data.completion_date}</p>
      </div>
    );
  }
  return null;
};

const DashboardPackages = ({ chartData }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Package Completion</CardTitle>
        <CardDescription>Completion status for packages</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            width={500}
            height={300}
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="package"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<CustomTooltip hideLabel />}
            />
            <Bar dataKey="completion" fill="var(--color-completion)" radius={8}>
              <LabelList
                dataKey="completion"
                position="top"
                content={({ x = 0, y = 0, width = 0, value }) => (
                  <text
                    x={Number(x) + Number(width) / 2}
                    y={Number(y) - 5}
                    fontSize={12}
                    fill="#000"
                    textAnchor="middle"
                  >
                    {value}% Completion
                  </text>
                )}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Package completion rates updated
        </div>
        <div className="leading-none text-muted-foreground">
          Showing completion percentages for available packages.
        </div>
      </CardFooter>
    </Card>
  );
};

export default DashboardPackages;
