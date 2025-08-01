"use client";

import { useToast } from "@/hooks/use-toast";
import { ClaimPackageHandler } from "@/services/Package/Member";
import { usePackageChartData } from "@/store/usePackageChartData";
import { useUserTransactionHistoryStore } from "@/store/useTransactionStore";
import { useUserDashboardEarningsStore } from "@/store/useUserDashboardEarnings";
import { useUserEarningsStore } from "@/store/useUserEarningsStore";
import { formatNumberLocale } from "@/utils/function";
import { ChartDataMember, company_member_table } from "@/utils/types";
import Image from "next/image";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "../ui/button";

type DashboardPackagesProps = {
  teamMemberProfile: company_member_table;
};

const DashboardPackages = ({ teamMemberProfile }: DashboardPackagesProps) => {
  const { toast } = useToast();
  const { earnings, setEarnings } = useUserEarningsStore();
  const { chartData, setChartData } = usePackageChartData();
  const { totalEarnings, setTotalEarnings } = useUserDashboardEarningsStore();
  const { setAddTransactionHistory } = useUserTransactionHistoryStore();
  const [isLoading, setIsLoading] = useState<string | null>(null);

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

        setChartData(
          chartData.filter(
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 border-2 border-bg-primary-blue rounded-md p-4">
      {chartData.map((data, index) => (
        <div
          key={index}
          className="flex items-center justify-around border-2 border-bg-primary-blue relative rounded-md"
        >
          <div className="p-2">
            <Image
              src={data.package_image}
              alt={data.package}
              width={100}
              height={100}
              className="w-full h-full"
            />
          </div>

          <div className="flex flex-col gap-4 p-2">
            <div className="text-3xl font-normal text-center space-x-1">
              <span>{formatNumberLocale(data.current_amount)}</span>
            </div>
            <div className="space-y-1">
              <div className="text-xs space-x-1">
                <span>DAILY EARN:</span>
                <span>
                  {" "}
                  {formatNumberLocale(
                    dailyEarn(
                      data.amount + data.profit_amount,
                      data.package_days
                    )
                  )}
                </span>
              </div>
              <div className="text-xs space-x-1">
                <span>PROFIT:</span>
                <span> {formatNumberLocale(data.profit_amount)}</span>
              </div>

              {!data.is_ready_to_claim && (
                <div className="text-xs space-x-1">
                  <span>DAYS LEFT:</span>
                  <span className="text-bg-primary-blue">
                    {data.package_days_remaining}
                  </span>
                </div>
              )}
              <Button
                className=" font-black rounded-md px-2 w-full mt-2"
                type="submit"
                disabled={
                  !data.is_ready_to_claim ||
                  isLoading === data.package_connection_id
                }
                onClick={() => handleClaimPackage(data)}
              >
                {data.is_ready_to_claim ? "Collect" : "Generating..."}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardPackages;
