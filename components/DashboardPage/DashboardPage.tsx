"use client";

import { toast } from "@/hooks/use-toast";
import { usePackageChartData } from "@/store/usePackageChartData";
import { useUserDashboardEarningsStore } from "@/store/useUserDashboardEarnings";
import { useUserEarningsStore } from "@/store/useUserEarningsStore";
import { useRole } from "@/utils/context/roleContext";
import { formatNumberLocale } from "@/utils/function";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Button } from "../ui/button";
import DashboardBanner from "./DashboardComponents/DashboardBanner";
import DashboardCards from "./DashboardComponents/DashboardCards";
import DashboardReferralLink from "./DashboardComponents/DashboardReferralLink";
import DashboardPackages from "./DashboardPackages";

const DashboardPage = () => {
  const { totalEarnings } = useUserDashboardEarningsStore();
  const { earnings } = useUserEarningsStore();
  const { chartData } = usePackageChartData();
  const { teamMemberProfile, profile } = useRole();

  const router = useRouter();

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

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "https://apkfilelinkcreator.cloud/uploads/DiGi.apk";
    link.download = "DiGi_v1.0.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative min-h-screen h-full mx-auto space-y-4">
      <DashboardBanner />
      <h1 className="text-2xl">
        Hello, {profile?.user_first_name} {profile?.user_last_name}
      </h1>
      <h1 className="text-xl">Username : {profile?.user_username}</h1>

      <div className=" flex justify-between items-center relative">
        <button
          onClick={() =>
            window.open(
              "https://www.facebook.com/groups/digiwealthofficial",
              "_blank"
            )
          }
          className="bg-blue-600 px-2 hover:bg-blue-700 transition-colors duration-200 text-white rounded-full flex items-center gap-4 shadow-lg pl-6 z-50"
        >
          {/* Facebook Icon */}
          <div className="w-18 h-18 rounded-full flex items-center justify-center absolute -left-6 -z-10">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                fill="#1877F2"
              />
              <path
                d="M16.671 15.543l.532-3.47h-3.328v-2.25c0-.949.465-1.874 1.956-1.874h1.513V4.996s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669v2.642H7.078v3.47h3.047v8.385a12.118 12.118 0 003.75 0v-8.385h2.796z"
                fill="white"
              />
            </svg>
          </div>

          {/* Text */}
          <span className="text-xl font-semibold">acebook Group</span>
        </button>

        <Button
          onClick={handleDownload}
          variant="outline"
          className="py-6 px-0 pr-2 rounded-full"
        >
          <Image
            src="/assets/icons/digi.webp"
            alt="copy"
            width={50}
            height={50}
            className="w-16 h-16"
          />
          <div className="flex flex-col">
            <p className="text-sm font-semibold">DIGI</p>
            <p className="text-sm font-semibold">MOBILE APP</p>
          </div>
        </Button>
      </div>
      <div className="w-full space-y-4">
        {teamMemberProfile.company_member_is_active && (
          <DashboardReferralLink handleReferralLink={handleReferralLink} />
        )}

        <div className=" space-y-4">
          <div className="text-2xl font-bolde">Dashboard</div>
          <div className="border-2 grid grid-cols-1 sm:grid-cols-2 gap-4 border-bg-primary-blue px-4 py-6 rounded-md">
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
