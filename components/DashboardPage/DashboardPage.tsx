"use client";

import { getDashboard } from "@/services/Dasboard/Member";
import { createClientSide } from "@/utils/supabase/client";
import { ChartDataMember } from "@/utils/types";
import {
  alliance_earnings_table,
  alliance_member_table,
  alliance_referral_link_table,
  package_table,
} from "@prisma/client";
import { useEffect, useState } from "react";

import CardAmount from "../ui/cardAmount";
import TableLoading from "../ui/tableLoading";
import DashboardDepositRequest from "./DashboardDepositRequest/DashboardDepositRequest";
import DashboardWithdrawRequest from "./DashboardWithdrawRequest/DashboardWithdrawRequest";

type Props = {
  earnings: alliance_earnings_table;
  teamMemberProfile: alliance_member_table;
  referal: alliance_referral_link_table;
  packages: package_table[];
};

const DashboardPage = ({
  earnings,
  referal,
  teamMemberProfile,
  packages,
}: Props) => {
  const supabaseClient = createClientSide();
  const [chartData, setChartData] = useState<ChartDataMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch package data
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
    <div className="min-h-screen h-full mx-auto py-8 border-2">
      {isLoading && <TableLoading />}

      <div className="w-full space-y-6 px-4 md:px-10">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {/* Referral and Wallet Section */}
        <div className="flex items-center justify-between p-4 rounded-lg shadow-md bg-white">
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
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardAmount
            title="Total Earnings"
            value={earnings.alliance_olympus_earnings}
            description=""
            descriptionClassName="text-sm text-green-600"
          />
          <CardAmount
            title="Total Withdraw"
            value={earnings.alliance_olympus_loot}
            description=""
            descriptionClassName="text-sm text-gray-500"
          />
          <CardAmount
            title="Ally Bounty"
            value={earnings.alliance_ally_bounty}
            description=""
            descriptionClassName="text-sm text-green-600"
          />
          <CardAmount
            title="Legion Bounty"
            value={earnings.alliance_legion_bounty}
            description=""
            descriptionClassName="text-sm text-red-600"
          />
        </div>

        <div className="w-full flex flex-col sm:flex-row space-6 gap-6">
          <DashboardDepositRequest
            earnings={earnings}
            packages={packages}
            teamMemberProfile={teamMemberProfile}
          />
          <DashboardWithdrawRequest
            earnings={earnings}
            teamMemberProfile={teamMemberProfile}
          />
        </div>

        {/* Packages Section (Uncomment if needed) */}
        {/* <DashboardPackages chartData={chartData} /> */}
      </div>
    </div>
  );
};

export default DashboardPage;
