"use client";

import { claimPackage } from "@/app/actions/package/packageAction";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ChartDataMember, DashboardEarnings } from "@/utils/types";
import { alliance_earnings_table } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

type Props = {
  chartData: ChartDataMember[];
  setChartData: Dispatch<SetStateAction<ChartDataMember[]>>;
  setEarnings: Dispatch<SetStateAction<alliance_earnings_table | null>>;
  setTotalEarnings: Dispatch<SetStateAction<DashboardEarnings | null>>;
};

const DashboardPackages = ({
  chartData,
  setChartData,
  setEarnings,
  setTotalEarnings,
}: Props) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClaimPackage = async (
    amount: number,
    earnings: number,
    packageConnectionId: string
  ) => {
    try {
      setIsLoading(true);
      const response = await claimPackage({
        packageConnectionId,
        amount,
        earnings,
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
        if (setEarnings) {
          setEarnings((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              alliance_olympus_earnings:
                prev.alliance_olympus_earnings + amount + earnings,
              alliance_combined_earnings:
                prev.alliance_combined_earnings + amount + earnings,
            };
          });
        }
        setTotalEarnings((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            totalEarnings: prev.totalEarnings + amount + earnings,
          };
        });
        setIsOpen(false);
      }
    } catch (error) {
      toast({
        title: "Failed to claim package",
        description: "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollArea className="w-full pb-10">
      <div className="flex grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ">
        {chartData.map((data, index) => (
          <Card
            key={index}
            style={{
              background: `linear-gradient(110deg, ${data.package_color || "#F6DB4E"} 60%, #ED9738)`, // Make package color dominate
            }}
            className={`min-w-[260px] max-w-[500px] h-auto dark:bg-${data.package_color || "cardColor"} transition-all duration-300 `}
          >
            <CardHeader>
              <CardTitle className="flex justify-end items-end">
                <div className="text-xs rounded-full  bg-black p-2">
                  {data.completion.toFixed(2)}%
                </div>
              </CardTitle>
              <CardDescription className="space-y-2">
                <div className="flex justify-between items-center">
                  <Badge className="dark:bg-black dark:text-white min-w-[80px] text-center flex items-center justify-center">
                    Amount
                  </Badge>
                  <span className="text-lg font-extrabold text-black">
                    {"₱ "}
                    {data.amount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <Badge className="dark:bg-black dark:text-white min-w-[80px] text-center flex items-center justify-center">
                    Profit
                  </Badge>
                  <span className="text-lg font-extrabold text-black">
                    {"₱ "}
                    {data.profit_amount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </CardDescription>

              <Separator />
            </CardHeader>

            <CardContent className=" space-y-1 pb-0">
              <div className="flex flex-col items-center">
                <Badge className="dark:bg-black dark:text-white dark:hover:bg-black hover:bg-black hover:text-white">
                  Total Amount
                </Badge>
                <span className="text-2xl font-extrabold text-black">
                  {"₱ "}
                  {(data.amount + data.profit_amount).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>

                <span className="text-xl  text-black font-extrabold">
                  {data.package} Plan
                </span>
              </div>
              <Separator />
            </CardContent>
            <CardFooter className="flex-col items-center gap-2 text-sm">
              <div className=" font-extrabold text-sm text-black">
                {new Intl.DateTimeFormat("en-US", {
                  month: "long", // Full month name
                  day: "numeric", // Day of the month
                  year: "numeric", // Full year
                }).format(new Date(data.completion_date))}
              </div>
              {data.is_ready_to_claim && (
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogDescription></DialogDescription>
                  <DialogTrigger asChild>
                    <Badge className="dark:bg-black dark:text-white dark:hover:bg-black hover:bg-black hover:text-white cursor-pointer px-10 py-2">
                      Collect
                    </Badge>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-bold mb-4">
                        Claim Package
                      </DialogTitle>
                      Are you sure you want to claim this package?
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        disabled={isLoading}
                        onClick={() =>
                          handleClaimPackage(
                            data.amount,
                            data.profit_amount,
                            data.package_connection_id
                          )
                        }
                        className="w-full"
                        variant="card"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {"Claiming ..."}
                          </>
                        ) : (
                          "Claim"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default DashboardPackages;
