"use client";

import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ClaimPackageHandler } from "@/services/Package/Member";
import { usePackageChartData } from "@/store/usePackageChartData";
import { useUserTransactionHistoryStore } from "@/store/useTransactionStore";
import { useUserDashboardEarningsStore } from "@/store/useUserDashboardEarnings";
import { useUserEarningsStore } from "@/store/useUserEarningsStore";
import { formateMonthDateYearv2, formatTime } from "@/utils/function";
import { ChartDataMember } from "@/utils/types";
import { company_member_table } from "@prisma/client";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "../ui/button";
import ReusableCard from "../ui/card-reusable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

type DashboardPackagesProps = {
  teamMemberProfile: company_member_table;
};

const DashboardPackages = ({ teamMemberProfile }: DashboardPackagesProps) => {
  const { toast } = useToast();
  const { earnings, setEarnings } = useUserEarningsStore();
  const { chartData, setChartData } = usePackageChartData();
  const { totalEarnings, setTotalEarnings } = useUserDashboardEarningsStore();
  const { setAddTransactionHistory } = useUserTransactionHistoryStore();
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [liveData, setLiveData] = useState(() => {
    return chartData.map((data) => ({
      ...data,
      currentPercentage: data.completion,
      current_amount: data.current_amount,
    }));
  });

  useEffect(() => {
    const animationFrames: { [key: string]: number } = {};

    chartData.forEach((data: ChartDataMember, index: number) => {
      const animate = () => {
        const now = Date.now();
        const startDate = new Date(data.package_date_created).getTime();
        const completionDate = new Date(data.completion_date).getTime();
        const totalTime = Math.max(completionDate - startDate, 1); // prevent divide by 0
        const elapsedTime = Math.max(now - startDate, 0);

        const percentage = Math.min((elapsedTime / totalTime) * 100, 100);
        const finalAmount = data.amount + data.profit_amount;
        const currentAmount = finalAmount * (percentage / 100);

        setLiveData((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...data,
            is_ready_to_claim: percentage === 100,
            currentPercentage: Number(percentage.toFixed(2)),
            current_amount: currentAmount,
          };
          return updated;
        });

        if (percentage < 100) {
          animationFrames[data.package_connection_id] =
            requestAnimationFrame(animate);
        }
      };

      animationFrames[data.package_connection_id] =
        requestAnimationFrame(animate);
    });

    return () => {
      Object.values(animationFrames).forEach(cancelAnimationFrame);
    };
  }, [chartData]);

  const handleClaimPackage = async (packageData: ChartDataMember) => {
    const { amount, profit_amount, package_connection_id } = packageData;

    try {
      setIsLoading(package_connection_id);
      const response = await ClaimPackageHandler({
        packageConnectionId: package_connection_id,
        earnings: profit_amount,
        amount,
      });

      if (response.ok) {
        toast({
          title: "Package claimed successfully",
          description: "You have successfully claimed the package",
        });

        setChartData(
          chartData.filter(
            (data) => data.package_connection_id !== package_connection_id
          )
        );

        setLiveData(
          liveData.filter(
            (data) => data.package_connection_id !== package_connection_id
          )
        );

        const newEarnings = amount + profit_amount;

        // Update earnings
        if (earnings) {
          setEarnings({
            ...earnings,
            company_earnings_id: earnings.company_earnings_id || "",
            company_member_wallet: earnings.company_member_wallet || 0,
            company_package_earnings:
              earnings.company_package_earnings + newEarnings,
            company_referral_earnings: earnings.company_referral_earnings || 0,
            company_combined_earnings:
              earnings.company_combined_earnings + newEarnings,
            company_earnings_member_id:
              earnings.company_earnings_member_id || "",
          });
        }

        setAddTransactionHistory({
          data: [
            {
              company_transaction_id: uuidv4(),
              company_transaction_date: new Date(),
              company_transaction_description: ` ${packageData.package} Package Claimed`,
              company_transaction_details: "",
              company_transaction_amount: newEarnings,
              company_transaction_attachment: "",
              company_transaction_member_id:
                teamMemberProfile.company_member_id,
              company_transaction_type: "PACKAGE",
            },
          ],
          count: 1,
        });

        // Update total earnings
        setTotalEarnings({
          ...totalEarnings!,
          totalEarnings: totalEarnings!.totalEarnings + newEarnings,
        });
      }
      setOpenDialogId(null);
    } catch (error) {
      toast({
        title: "Failed to claim package",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null); // Clear loading state
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
      {liveData.map((data) => (
        <ReusableCard
          key={data.package_connection_id}
          title={data.package}
          className="relative p-0"
        >
          <div className="flex flex-col xl:flex-row items-center gap-6 p-4">
            {/* Left: Small GIF */}
            <div className="flex-shrink-0 flex justify-center">
              <Image
                src={data.package_gif || "/fallback.gif"}
                alt={`${data.package} GIF`}
                width={300}
                height={300}
                unoptimized
                className="object-contain"
              />
            </div>

            {/* Right: Full-size package image */}
            <div className="flex-grow overflow-visible relative flex flex-col gap-2 z-50">
              <div className="relative w-full dark:bg-black rounded-full h-10 border border-yellow-500 shadow-inner overflow-hidden">
                <div
                  className={cn(
                    "absolute top-0 left-0 h-full transition-all duration-300 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-100 shadow-md",
                    data.currentPercentage >= 100
                      ? "rounded-full"
                      : "rounded-l-full rounded-r-[6px]" // add slight right rounding for smoother visuals
                  )}
                  style={{
                    width: `${data.currentPercentage}%`,
                    minWidth: "8px", // ensures rounded corners still appear at low %
                  }}
                ></div>
                <span className="absolute inset-0 flex items-center justify-center font-extrabold text-white tracking-wide drop-shadow text-2xl">
                  {data.current_amount.toFixed(2)}
                </span>
              </div>

              <ReusableCard>
                <div className="flex flex-col gap-2 text-sm stroke-text-orange uppercase">
                  <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
                    <span className="font-semibold">Date Invested:</span>
                    <span className="text-white">
                      {formateMonthDateYearv2(data.package_date_created)}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
                    <span className="font-semibold">Amount Invested:</span>
                    <span className="text-white">{data.amount}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
                    <span className="font-semibold">Generated Income:</span>
                    <span className="text-white">{data.profit_amount}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
                    <span className="font-semibold">Date Of Claim:</span>
                    <span className="text-white">
                      {formateMonthDateYearv2(data.completion_date)}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
                    <span className="font-semibold">Time of Claim:</span>
                    <span className="text-white">
                      {formatTime(data.completion_date)}
                    </span>
                  </div>
                </div>
                {data.is_ready_to_claim && (
                  <Dialog
                    open={openDialogId === data.package_connection_id}
                    onOpenChange={(isOpen) =>
                      setOpenDialogId(
                        isOpen ? data.package_connection_id : null
                      )
                    }
                  >
                    <DialogDescription></DialogDescription>
                    <DialogTrigger asChild>
                      <Button
                        variant="card"
                        className=" font-black text-2xl rounded-full p-5 w-full pt-"
                        type="submit"
                      >
                        CLAIM
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      type="earnings"
                      className="bg-amber-950 dark:bg-[#190e0a] dark:border-orange-500 text-white dark:text-white"
                    >
                      <DialogHeader>
                        <DialogTitle className="text-bold mb-4">
                          Collect
                        </DialogTitle>
                        Collect this package to gain your earnings
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          disabled={isLoading === data.package_connection_id}
                          onClick={() => handleClaimPackage(data)}
                          className="w-full"
                          variant="card"
                        >
                          {isLoading === data.package_connection_id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              {"Collecting ..."}
                            </>
                          ) : (
                            "Collect"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </ReusableCard>
            </div>
          </div>
        </ReusableCard>
      ))}
    </div>
  );
};

export default DashboardPackages;
