"use client";

import { toast } from "@/hooks/use-toast";
import { usePackageChartData } from "@/store/usePackageChartData";
import { useUserDashboardEarningsStore } from "@/store/useUserDashboardEarnings";
import { useUserEarningsStore } from "@/store/useUserEarningsStore";
import { useRole } from "@/utils/context/roleContext";
import { formatNumberLocale } from "@/utils/function";
import DashboardCards from "./DashboardComponents/DashboardCards";
import DashboardCommunity from "./DashboardComponents/DashboardCommunity";
import DashboardNavigation from "./DashboardComponents/DashboardNavigation";
import DashboardReferralLink from "./DashboardComponents/DashboardReferralLink";
import DashboardSocket from "./DashboardComponents/DashboardSocket";
import DashboardPackages from "./DashboardPackages";

const DashboardPage = () => {
  const { earnings } = useUserEarningsStore();
  const { totalEarnings } = useUserDashboardEarningsStore();
  const { chartData } = usePackageChartData();
  const { teamMemberProfile } = useRole();

  const handleReferralLink = (referralLink: string) => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Referral LinkCopied",
      variant: "success",
    });
  };

  const totalEarningsMap = [
    {
      label: "Available Balance",
      key: "total_available_balance",
      value: earnings?.company_combined_earnings,
    },
    {
      label: "Subscription Earnings",
      key: "package_income",
      value: totalEarnings?.packageEarnings,
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
  ];

  return (
    <div className="relative min-h-screen h-full mx-auto">
      <div className="w-full space-y-4 md:px-10">
        <DashboardNavigation />

        <DashboardReferralLink handleReferralLink={handleReferralLink} />

        <div className=" space-y-4">
          <DashboardSocket />

          <div className="px-6">
            {totalEarningsMap.map((item) => (
              <div key={item.key} className="mb-3 text-center">
                <div className="text-sm mb-1">{item.label}</div>
                <div className="bg-white text-black py-1 rounded-lg font-semibold text-lg">
                  ₱ {formatNumberLocale(item.value ?? 0)}
                </div>
              </div>
            ))}
          </div>

          {chartData.length > 0 && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2 pb-2">
                <h1 className="text-xl font-bold text-bg-primary-blue">
                  ACTIVE SUBSCRIPTIONS
                </h1>
              </div>
              <DashboardPackages teamMemberProfile={teamMemberProfile} />
            </div>
          )}

          <DashboardCards />
        </div>

        <DashboardCommunity />
      </div>
    </div>
  );
};

export default DashboardPage;
