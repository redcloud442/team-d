"use client";

import { useToast } from "@/hooks/use-toast";
import { ClaimPackageHandler } from "@/services/Package/Member";
import { usePackageChartData } from "@/store/usePackageChartData";
import { useUserTransactionHistoryStore } from "@/store/useTransactionStore";
import { useUserDashboardEarningsStore } from "@/store/useUserDashboardEarnings";
import { useUserEarningsStore } from "@/store/useUserEarningsStore";
import { ChartDataMember, company_member_table } from "@/utils/types";
import { ArrowDown, Crown, Loader2 } from "lucide-react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
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
              company_transaction_description: ` ${packageData.package} Collected`,
              company_transaction_details: "",
              company_transaction_amount: newEarnings,
              company_transaction_attachment: "",
              company_transaction_member_id:
                teamMemberProfile.company_member_id,
              company_transaction_type: "EARNINGS",
              company_transaction_note: null,
            },
          ],
          count: 1,
        });

        // Update total earnings
        setTotalEarnings({
          ...totalEarnings!,
          packageEarnings: totalEarnings!.packageEarnings + newEarnings,
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

  const dailyEarn = (totalAmount: number, numberOfDays: number) => {
    const dailyEarn = totalAmount / numberOfDays;
    return dailyEarn;
  };

  return (
    <ScrollArea className="w-full h-fit px-6">
      <div className="flex gap-4">
        {liveData.map((data, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-between border-2 border-bg-primary-blue max-w-[150px] relative mt-10"
          >
            <div className="border-b-2 border-bg-primary-blue w-full text-center">
              <h1 className="text-lg font-bold ">{data.package}</h1>
            </div>

            {data.package_is_highlight && (
              <Crown className="absolute w-10 h-10 text-bg-primary-blue -top-11 right-1/5 -translate-x-1/2 " />
            )}

            <div className="flex flex-col items-center justify-between gap-4 border-b-2 border-bg-primary-blue w-full">
              <div className="flex flex-col items-center justify-between gap-4 p-4">
                <h1 className="text-lg font-bold ">{data.amount}</h1>

                <ArrowDown className="w-8 h-8 text-bg-primary-blue" />

                <h1 className="text-lg font-bold text-bg-primary-blue">
                  {data.amount + data.profit_amount}
                </h1>
              </div>
            </div>

            <div className="flex flex-col gap-1 p-2">
              <div className="text-xs space-x-1">
                <span>DAILY EARN:</span>
                <span>
                  ₱{" "}
                  {dailyEarn(
                    data.amount + data.profit_amount,
                    data.package_days
                  ).toFixed(2)}
                </span>
              </div>
              <div className="text-xs space-x-1">
                <span>PROFIT:</span>
                <span>₱ {data.profit_amount.toFixed(2)}</span>
              </div>

              <div className="text-xs space-x-1">
                <span>DAYS LEFT:</span>
                <span className="text-bg-primary-blue">
                  {data.package_days_remaining}
                </span>
                <span>Days</span>
              </div>
            </div>

            <Dialog
              open={openDialogId === data.package_connection_id}
              onOpenChange={(isOpen) =>
                setOpenDialogId(isOpen ? data.package_connection_id : null)
              }
            >
              <DialogDescription></DialogDescription>
              <DialogTrigger asChild>
                <Button
                  className=" font-black rounded-md px-2 m-2"
                  type="submit"
                  disabled={!data.is_ready_to_claim}
                >
                  {data.is_ready_to_claim ? "COMPLETE" : "GENERATING..."}
                </Button>
              </DialogTrigger>
              <DialogContent type="earnings">
                <DialogHeader>
                  <DialogTitle className="text-bold mb-4">Generate</DialogTitle>
                  <DialogDescription>
                    Generate subscription earnings
                  </DialogDescription>
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
                        {"Generating ..."}
                      </>
                    ) : (
                      "Generate"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ))}
      </div>

      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default DashboardPackages;
