"use client";

import { claimPackage } from "@/app/actions/package/packageAction";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ChartDataMember } from "@/utils/types";
import { Dispatch, SetStateAction } from "react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

type Props = {
  chartData: ChartDataMember[];
  setChartData: Dispatch<SetStateAction<ChartDataMember[]>>;
};

const DashboardPackages = ({ chartData, setChartData }: Props) => {
  const { toast } = useToast();
  const handleClaimPackage = async (
    amount: number,
    packageConnectionId: string
  ) => {
    try {
      const response = await claimPackage({
        packageConnectionId,
        amount,
      });

      if (response.success) {
        toast({
          title: "Package claimed successfully",
          description: "You have successfully claimed the package",
        });
        setChartData((prev) =>
          prev.filter(
            (data) => data.package_connection_id !== packageConnectionId
          )
        );
      }
    } catch (error) {
      toast({
        title: "Failed to claim package",
        description: "Please try again later",
      });
    }
  };
  return (
    <ScrollArea className="w-full">
      <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chartData.map((data, index) => (
          <div key={index} className="relative">
            <Card
              className={`min-w-[310px] md:w-full  hover:shadow-gray-500 dark:hover:shadow-gray-600  transition-all duration-300 ${
                data.is_ready_to_claim ? "opacity-50" : ""
              }`}
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
                  <span className="text-sm font-medium">
                    {data.completion}%
                  </span>
                </div>
                <Progress value={data.completion} max={100} />
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="font-medium leading-none">
                  Amount: ₱
                  {data.amount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="leading-none text-muted-foreground">
                  Package completion rate updated.
                </div>
              </CardFooter>
            </Card>
            {data.is_ready_to_claim && (
              <div className="absolute inset-0 hover:shadow-lg bg-gray-800 bg-opacity-70 rounded-lg flex items-center justify-center">
                <Button
                  className="px-4 py-2 text-white"
                  onClick={() =>
                    handleClaimPackage(data.amount, data.package_connection_id)
                  }
                >
                  Claim Package
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default DashboardPackages;
