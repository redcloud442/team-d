"use client";

import { toast } from "@/hooks/use-toast";
import { usePackageChartData } from "@/store/usePackageChartData";
import { useUserDashboardEarningsStore } from "@/store/useUserDashboardEarnings";
import { useUserEarningsStore } from "@/store/useUserEarningsStore";
import { useRole } from "@/utils/context/roleContext";
import { formatNumberLocale } from "@/utils/function";
import { useMemo } from "react";
import DashboardCards from "./DashboardComponents/DashboardCards";
import DashboardReferralLink from "./DashboardComponents/DashboardReferralLink";
import DashboardPackages from "./DashboardPackages";

const DashboardPage = () => {
  const { totalEarnings } = useUserDashboardEarningsStore();
  const { earnings } = useUserEarningsStore();
  const { chartData } = usePackageChartData();
  const { teamMemberProfile, profile } = useRole();

  const vatAmount = useMemo(() => {
    return (totalEarnings?.withdrawalAmount ?? 0) * 0.1;
  }, [totalEarnings?.withdrawalAmount]);

  const handleReferralLink = (referralLink: string) => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Referral LinkCopied",
      variant: "success",
    });
  };

  const totalEarningsMap = [
    {
      label: "Total Available Balance",
      key: "total_available_balance",
      value: earnings?.company_combined_earnings,
    },
    {
      label: "Direct Referral Earnings",
      key: "direct_referral_amount",
      value: totalEarnings?.directReferralAmount,
    },
    {
      label: "Unilevel Earnings",
      key: "indirect_referral_amount",
      value: totalEarnings?.indirectReferralAmount,
    },
    {
      label: "Total Subscription Earnings",
      key: "package_income",
      value: totalEarnings?.packageEarnings,
    },
    {
      label: "Total Withdrawal",
      key: "total_withdrawal",
      value: totalEarnings?.withdrawalAmount,
    },
    {
      label: "VAT Refund",
      key: "total_vat",
      value: vatAmount,
    },
  ];

  return (
    <div className="relative min-h-screen h-full mx-auto space-y-4">
      <h1 className="text-2xl">
        Hello, {profile?.user_first_name} {profile?.user_last_name}
      </h1>
      <h1 className="text-xl">Username : {profile?.user_username}</h1>
      <div className="w-full space-y-4">
        {teamMemberProfile.company_member_is_active && (
          <DashboardReferralLink handleReferralLink={handleReferralLink} />
        )}

        <div className=" space-y-4">
          <div className="text-2xl font-bolde">Dashboard</div>
          <div className="border-2 grid grid-cols-2 gap-4 border-bg-primary-blue px-4 py-6 rounded-md">
            {totalEarningsMap.map((item) => (
              <div key={item.key} className="mb-3 text-center">
                <div className="text-xl mb-1 text-bg-primary-blue">
                  {item.label}
                </div>
                <div className=" text-white py-1 rounded-lg font-semibold text-lg">
                  ₱ {formatNumberLocale(item.value ?? 0)}
                </div>
              </div>
            ))}
          </div>

          <DashboardCards />
          {chartData.length > 0 && (
            <>
              <h1 className="text-xl font-bold">ACTIVE SUBSCRIPTIONS</h1>
              <DashboardPackages teamMemberProfile={teamMemberProfile} />
            </>
          )}
        </div>

        {/* <DashboardCommunity /> */}
      </div>
    </div>
  );
};

export default DashboardPage;
