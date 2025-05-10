"use client";

import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { logError } from "@/services/Error/ErrorLogs";
import { getUserEarnings } from "@/services/User/User";
import { usePackageChartData } from "@/store/usePackageChartData";
import { useUserDashboardEarningsStore } from "@/store/useUserDashboardEarnings";
import { useUserEarningsStore } from "@/store/useUserEarningsStore";
import { useUserHaveAlreadyWithdraw } from "@/store/useWithdrawalToday";
import { useRole } from "@/utils/context/roleContext";
import { formatDateToYYYYMMDD } from "@/utils/function";
import { createClientSide } from "@/utils/supabase/client";
import { package_table } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import CardBalance from "../ui/card-balance";
import ReusableCard from "../ui/card-reusable";
import {
  default as DashboardCardBg,
  default as ReusableCardBg,
} from "./DashboardCardBg/DashboardCardBg";
import DashboardDepositProfile from "./DashboardDepositRequest/DashboardDepositModal/DashboardDepositProfile";
import DashboardTotalEarnings from "./DashboardDepositRequest/DashboardTotalEarnings/DashboardTotalEarnings";
import DashboardPackages from "./DashboardPackages";

type Props = {
  packages: package_table[];
};

const DashboardPage = ({ packages }: Props) => {
  const supabaseClient = createClientSide();
  const { referral } = useRole();
  const { earnings, setEarnings } = useUserEarningsStore();
  const { setTotalEarnings } = useUserDashboardEarningsStore();
  const { chartData } = usePackageChartData();
  const { teamMemberProfile, profile } = useRole();
  const { isWithdrawalToday, canUserDeposit } = useUserHaveAlreadyWithdraw();
  const [isActive, setIsActive] = useState(
    teamMemberProfile.company_member_is_active
  );

  const [refresh, setRefresh] = useState(false);

  const handleRefresh = async () => {
    try {
      setRefresh(true);
      const { totalEarnings, userEarningsData } = await getUserEarnings({
        memberId: teamMemberProfile.company_member_id,
      });

      if (!totalEarnings || !userEarningsData) return;

      setTotalEarnings({
        directReferralAmount: totalEarnings.directReferralAmount ?? 0,
        indirectReferralAmount: totalEarnings.indirectReferralAmount ?? 0,
        totalEarnings: totalEarnings.totalEarnings ?? 0,
        withdrawalAmount: totalEarnings.withdrawalAmount ?? 0,
        directReferralCount: totalEarnings.directReferralCount ?? 0,
        indirectReferralCount: totalEarnings.indirectReferralCount ?? 0,
        packageEarnings: totalEarnings.packageEarnings ?? 0,
      });

      setEarnings(userEarningsData);
    } catch (e) {
      if (e instanceof Error) {
        await logError(supabaseClient, {
          errorMessage: e.message,
        });
      }
    } finally {
      setRefresh(false);
    }
  };

  const handleReferralLink = (referralLink: string) => {
    navigator.clipboard.writeText(referralLink);

    toast({
      title: "Referral link copied to clipboard",
      description: "You can now share it with your friends",
    });
  };

  return (
    <div className="relative min-h-screen h-full mx-auto py-4">
      <div className="w-full space-y-4 md:px-10">
        <ReusableCard type="user" className="p-0 space-y-4">
          <DashboardCardBg type="gradient" className="p-2">
            <div className="flex flex-col justify-center items-center gap-4">
              <DashboardDepositProfile />
              <span className="text-2xl text-black text-balance">
                {" "}
                {profile.user_first_name} {profile.user_last_name}
              </span>
            </div>
          </DashboardCardBg>

          <div className="flex flex-col justify-center items-center gap-4">
            <div className="flex justify-center items-stretch gap-4">
              <DashboardCardBg className="min-h-[100px] flex-1 p-2 text-center text-black rounded-sm flex flex-col justify-center">
                <h2 className="text-lg font-bold whitespace-nowrap">
                  {profile.user_username}
                </h2>
                <p className="text-sm font-bold whitespace-nowrap">Username</p>
              </DashboardCardBg>

              <DashboardCardBg className="min-h-[100px] flex-1 p-2 text-center text-black rounded-sm flex flex-col justify-center">
                <div className="text-lg font-bold whitespace-nowrap">
                  {formatDateToYYYYMMDD(profile.user_date_created)}
                  <p className="text-sm font-bold whitespace-nowrap">
                    Member Since
                  </p>
                </div>
              </DashboardCardBg>
            </div>

            <div className="space-y-1">
              <div
                onClick={() =>
                  handleReferralLink(referral.company_referral_link)
                }
                className="text-xl text-center font-bold border-2 p-1 bg-orange-950 border-orange-500 cursor-pointer"
              >
                Get you referral link
              </div>
              <div className="text-[11px] font-bold border-2 p-1 bg-orange-950 border-orange-500 text-balance">
                {referral.company_referral_link}
              </div>
            </div>
          </div>
        </ReusableCard>

        <CardBalance
          packages={packages}
          setIsActive={setIsActive}
          active={isActive}
          handleClick={handleRefresh}
          refresh={refresh}
          value={earnings?.company_combined_earnings ?? 0}
        />

        <DashboardTotalEarnings refresh={refresh} />

        <ReusableCard type="user" className="p-0 space-y-4">
          <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ReusableCardBg type="gray" className="p-1">
              <Link
                href={!canUserDeposit ? "/deposit" : "#"}
                className={cn(
                  "flex flex-col items-center transition-opacity",
                  canUserDeposit && "pointer-events-none opacity-50 grayscale"
                )}
              >
                <Image
                  src="/assets/icons/deposit.ico"
                  alt="Deposit"
                  width={60}
                  height={60}
                />
                <p className="text-sm sm:text-lg font-bold mt-2">DEPOSIT</p>
              </Link>
            </ReusableCardBg>

            <ReusableCardBg type="gray" className="p-1">
              <Link
                href={
                  !isWithdrawalToday.package && !isWithdrawalToday.referral
                    ? "/withdraw"
                    : "#"
                }
                className={cn(
                  "flex flex-col items-center transition-opacity",
                  isWithdrawalToday.package &&
                    isWithdrawalToday.referral &&
                    "pointer-events-none opacity-50 grayscale"
                )}
              >
                <Image
                  src="/assets/icons/withdraw.ico"
                  alt="Withdraw"
                  width={60}
                  height={60}
                />
                <p className="text-[12px] sm:text-lg font-bold mt-2">
                  WITHDRAW
                </p>
              </Link>
            </ReusableCardBg>

            <ReusableCardBg type="gray" className="p-1">
              <Link
                href="/packages"
                className="flex flex-col items-center cursor-pointer"
              >
                <Image
                  src="/assets/icons/trading.ico"
                  alt="Trading"
                  width={60}
                  height={60}
                />
                <p className="text-[12px] sm:text-lg font-bold mt-2">TRADING</p>
              </Link>
            </ReusableCardBg>

            <ReusableCardBg type="gray" className="p-1">
              <Link
                href="/referral"
                className="flex flex-col items-center cursor-pointer"
              >
                <Image
                  src="/assets/icons/referral.ico"
                  alt="Referral"
                  width={60}
                  height={60}
                />
                <p className="text-[12px] sm:text-lg font-bold mt-2">
                  REFERRAL
                </p>
              </Link>
            </ReusableCardBg>

            <ReusableCardBg type="gray" className="p-1">
              <Link
                href="/matrix"
                className="flex flex-col items-center cursor-pointer"
              >
                <Image
                  src="/assets/icons/matrix.ico"
                  alt="Matrix"
                  width={60}
                  height={60}
                />
                <p className="text-[12px] sm:text-lg font-bold mt-2">MATRIX</p>
              </Link>
            </ReusableCardBg>

            <ReusableCardBg type="gray" className="p-1">
              <Link
                href="facebook.com"
                className="flex flex-col items-center cursor-pointer"
              >
                <Image
                  src="/assets/icons/fb.ico"
                  alt="Deposit"
                  width={60}
                  height={60}
                />
                <p className="text-[12px] sm:text-lg font-bold mt-2">
                  FB GROUP
                </p>
              </Link>
            </ReusableCardBg>
          </div>
        </ReusableCard>

        {/* <DashboardDepositModalPackages
          packages={packages}
          earnings={earnings}
          setIsActive={setIsActive}
          teamMemberProfile={teamMemberProfile}
          className="w-full"
        /> */}

        {chartData.length > 0 && (
          <div className=" gap-6">
            <DashboardPackages teamMemberProfile={teamMemberProfile} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
