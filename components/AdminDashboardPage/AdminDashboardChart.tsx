import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartData } from "@/utils/types";
import { Controller, useFormContext } from "react-hook-form";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

type Props = {
  chartData: ChartData[];
  fetchAdminDashboardData: () => void;
};

type FormContextType = {
  dateFilter: string;
};

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  earnings: {
    label: "Earnings",
    color: "hsl(var(--chart-1))",
  },
  withdraw: {
    label: "Withdraw",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const AdminDashboardChart = ({ chartData, fetchAdminDashboardData }: Props) => {
  const { control } = useFormContext<FormContextType>();

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Total Earnings And Withdrawal Chart</CardTitle>
          <CardDescription>
            Showing total visitors for the last 3 months
          </CardDescription>
        </div>
        <form>
          <Controller
            name="dateFilter"
            control={control}
            defaultValue="90 days"
            render={({ field }) => (
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  fetchAdminDashboardData();
                }}
                value={field.value}
              >
                <SelectTrigger
                  className="w-[160px] rounded-lg sm:ml-auto"
                  aria-label="Select a value"
                >
                  <SelectValue placeholder="Last 3 months" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="90 days" className="rounded-lg">
                    Last 3 months
                  </SelectItem>
                  <SelectItem value="30 days" className="rounded-lg">
                    Last 30 days
                  </SelectItem>
                  <SelectItem value="7 days" className="rounded-lg">
                    Last 7 days
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </form>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillEarnings" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-earnings)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-earnings)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillWithdraw" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-withdraw)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-withdraw)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-PH", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="withdraw"
              type="natural"
              fill="url(#fillWithdraw)"
              stroke="var(--color-withdraw)"
              stackId="a"
            />
            <Area
              dataKey="earnings"
              type="natural"
              fill="url(#fillEarnings)"
              stroke="var(--color-earnings)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default AdminDashboardChart;
