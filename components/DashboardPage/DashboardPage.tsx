"use client";

import { getDashboard } from "@/services/Dasboard/Member";
import { createClientSide } from "@/utils/supabase/client";
import { ChartDataMember } from "@/utils/types";
import {
  alliance_earnings_table,
  alliance_referral_link_table,
} from "@prisma/client";
import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import CardAmount from "../ui/cardAmount";
import TableLoading from "../ui/tableLoading";
import Text from "../ui/text";
import DashboardPackages from "./DashboardPackages";

type Props = {
  earnings: alliance_earnings_table;
  referal: alliance_referral_link_table;
};

const DashboardPage = ({ earnings, referal }: Props) => {
  const supabaseClient = createClientSide();
  const [chartData, setChartData] = useState<ChartDataMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getPackagesData = async () => {
    try {
      setIsLoading(true);
      const data = await getDashboard(supabaseClient, {
        teamMemberId: earnings.alliance_earnings_member_id,
      });
      setChartData(data);
    } catch (e) {
      console.error(e);
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
    <div className="Container">
      {isLoading && <TableLoading />}

      <div className="w-full space-y-6 max-w-5xl">
        <h1 className="Title">Dashboard</h1>
        <Card className="flex items-center justify-between p-4 rounded-lg shadow-md">
          {/* Referral Link */}
          <div>
            <Text>Referral Link</Text>
            <button
              onClick={copyReferralLink}
              className="text-blue-500 underline hover:text-blue-700"
            >
              Copy Referral Link
            </button>
          </div>

          {/* Wallet */}
          <div className="text-right">
            <Text>Wallet</Text>
            <p className="text-lg font-semibold text-green-600">
              ₱ {earnings.alliance_olympus_wallet.toLocaleString()}
            </p>
          </div>
        </Card>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
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

        {/* Packages Section */}
        <DashboardPackages chartData={chartData} />
      </div>
    </div>
  );
};

export default DashboardPage;
