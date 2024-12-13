"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChartDataMember } from "@/utils/types";

type Props = {
  chartData: ChartDataMember[];
};

const DashboardPackages = ({ chartData }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {chartData.map((data, index) => (
        <Card
          key={index}
          className="w-full hover:shadow-gray-500 dark:hover:shadow-gray-200 transition-all duration-300"
        >
          <CardHeader>
            <CardTitle>{data.package}</CardTitle>
            <CardDescription>
              Completion Date:{" "}
              {new Date(data.completion_date).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Completion</span>
              <span className="text-sm font-medium">{data.completion}%</span>
            </div>
            <Progress value={data.completion} max={100} />
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="font-medium leading-none">
              Amount: ₱{data.amount.toLocaleString()}
            </div>
            <div className="leading-none text-muted-foreground">
              Package completion rate updated.
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default DashboardPackages;
