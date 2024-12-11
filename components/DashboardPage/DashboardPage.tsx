"use client";

import { getDashboard } from "@/services/Dasboard/Member";
import { createClientSide } from "@/utils/supabase/client";
import { ChartDataMember, DashboardEarnings } from "@/utils/types";
import {
  alliance_earnings_table,
  alliance_member_table,
  alliance_referral_link_table,
  package_table,
} from "@prisma/client";
import { useEffect, useState } from "react";

import { Card } from "../ui/card";
import CardAmount from "../ui/cardAmount";
import TableLoading from "../ui/tableLoading";
import DashboardDepositRequest from "./DashboardDepositRequest/DashboardDepositRequest";
import DashboardPackages from "./DashboardPackages";
import DashboardWithdrawRequest from "./DashboardWithdrawRequest/DashboardWithdrawRequest";

type Props = {
  earnings: alliance_earnings_table;
  teamMemberProfile: alliance_member_table;
  referal: alliance_referral_link_table;
  packages: package_table[];
  dashboardEarnings: DashboardEarnings;
};

const DashboardPage = ({
  earnings: initialEarnings,
  referal,
  teamMemberProfile,
  packages,
  dashboardEarnings,
}: Props) => {
  const supabaseClient = createClientSide();
  const [chartData, setChartData] = useState<ChartDataMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [earnings, setEarnings] =
    useState<alliance_earnings_table>(initialEarnings);

  const getPackagesData = async () => {
    try {
      setIsLoading(true);
      const data = await getDashboard(supabaseClient, {
        teamMemberId: earnings.alliance_earnings_member_id,
      });
      setChartData(data);
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralLink = () => {
    const referralLink = referal.alliance_referral_link;
    navigator.clipboard.writeText(referralLink);
    alert("Referral link copied to clipboard!");
  };

  useEffect(() => {
    getPackagesData();
  }, []);

  return (
    <div className="min-h-screen h-full mx-auto py-8 ">
      {isLoading && <TableLoading />}

      <div className="w-full space-y-6 px-4 md:px-10">
        <h1 className="Title">Dashboard</h1>

        {/* Referral and Wallet Section */}
        <Card className="flex items-center justify-between p-4 rounded-lg shadow-md">
          <div>
            <p className="font-medium">Referral Link</p>
            <button
              onClick={copyReferralLink}
              className="text-blue-500 underline hover:text-blue-700"
            >
              Copy Referral Link
            </button>
          </div>

          <div className="text-right">
            <p className="font-medium">Wallet</p>
            <p className="text-lg font-semibold text-green-600">
              ₱ {earnings.alliance_olympus_wallet.toLocaleString()}
            </p>
          </div>
        </Card>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardAmount
            title="Total Earnings"
            value={
              Number(
                dashboardEarnings.totalEarnings
              ).toLocaleString() as unknown as number
            }
            description=""
            descriptionClassName="text-sm text-green-600"
          />
          <CardAmount
            title="Total Withdraw"
            value={
              Number(
                dashboardEarnings.withdrawalAmount
              ).toLocaleString() as unknown as number
            }
            description=""
            descriptionClassName="text-sm text-gray-500"
          />
          <CardAmount
            title="Direct Referral"
            value={
              Number(
                dashboardEarnings.directReferralAmount
              ).toLocaleString() as unknown as number
            }
            description=""
            descriptionClassName="text-sm text-green-600"
          />
          <CardAmount
            title="Indirect Referral"
            value={
              Number(
                dashboardEarnings.indirectReferralAmount
              ).toLocaleString() as unknown as number
            }
            description=""
            descriptionClassName="text-sm text-red-600"
          />
        </div>

        {chartData.length > 0 && (
          <div className=" gap-6">
            <DashboardPackages chartData={chartData} />
          </div>
        )}

        <div className="w-full flex flex-col lg:flex-row space-6 gap-6">
          <DashboardDepositRequest
            setChartData={setChartData}
            earnings={earnings}
            setEarnings={setEarnings}
            packages={packages}
            teamMemberProfile={teamMemberProfile}
          />
          <DashboardWithdrawRequest
            earnings={earnings}
            teamMemberProfile={teamMemberProfile}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
