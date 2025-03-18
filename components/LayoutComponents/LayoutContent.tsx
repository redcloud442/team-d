"use client";

import MobileNavBar from "@/components/ui/MobileNavBar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ROLE } from "@/utils/constant";
import { useRole } from "@/utils/context/roleContext";
import { alliance_member_table, user_table } from "@prisma/client";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useMemo } from "react";
import DevMode from "../ui/dev-mode";
import { ModeToggle } from "../ui/toggleDarkmode";

const LazyAppSidebar = dynamic(() => import("../ui/side-bar"), { ssr: false });

import { getDashboard } from "@/services/Dasboard/Member";
import {
  getUserEarnings,
  getUserSponsor,
  getUserWithdrawalToday,
} from "@/services/User/User";
import { useDailyTaskStore } from "@/store/useDailyTaskStore";
import { useUserLoadingStore } from "@/store/useLoadingStore";
import { usePackageChartData } from "@/store/usePackageChartData";
import { useSponsorStore } from "@/store/useSponsortStore";
import { useUserDashboardEarningsStore } from "@/store/useUserDashboardEarnings";
import { useUserEarningsStore } from "@/store/useUserEarningsStore";
import { useUserHaveAlreadyWithdraw } from "@/store/useWithdrawalToday";

type LayoutContentProps = {
  profile: user_table;
  teamMemberProfile: alliance_member_table;
  children: React.ReactNode;
};

export default function LayoutContent({
  profile,
  teamMemberProfile,
  children,
}: LayoutContentProps) {
  const { role } = useRole();
  const { setTheme } = useTheme();
  const { setTotalEarnings } = useUserDashboardEarningsStore();
  const { setEarnings } = useUserEarningsStore();
  const { setLoading } = useUserLoadingStore();
  const { setChartData } = usePackageChartData();
  const { setIsWithdrawalToday, setCanUserDeposit } =
    useUserHaveAlreadyWithdraw();
  const { setSponsor } = useSponsorStore();
  const { setDailyTask } = useDailyTaskStore();

  const isAdmin = useMemo(() => role === ROLE.ADMIN, [role]);

  useEffect(() => {
    if (!isAdmin) {
      setTheme("dark");
    }
  }, [isAdmin, setTheme]);

  const handleFetchTransaction = useCallback(async () => {
    if (isAdmin) return;

    try {
      setLoading(true);

      const [
        { totalEarnings, userEarningsData },
        dashboardData,
        dataWithdrawalToday,
        sponsorData,
      ] = await Promise.all([
        getUserEarnings({ memberId: teamMemberProfile.alliance_member_id }),
        getDashboard({ teamMemberId: teamMemberProfile.alliance_member_id }),
        getUserWithdrawalToday(),
        getUserSponsor({ userId: profile.user_id }),
      ]);

      const {
        canWithdrawReferral,
        canWithdrawPackage,
        canWithdrawWinning,
        canUserDeposit,
      } = dataWithdrawalToday.data;

      setTotalEarnings(totalEarnings);
      setEarnings(userEarningsData);
      setChartData(dashboardData);
      setCanUserDeposit(canUserDeposit);
      setIsWithdrawalToday({
        referral: canWithdrawReferral,
        package: canWithdrawPackage,
        winning: canWithdrawWinning,
      });

      setDailyTask(dataWithdrawalToday.data.response);
      setSponsor(sponsorData);
    } catch (e) {
      console.error("Failed to fetch transaction data", e);
    } finally {
      setLoading(false);
    }
  }, [
    isAdmin,
    teamMemberProfile.alliance_member_id,
    profile.user_id,
    setLoading,
  ]);

  useEffect(() => {
    handleFetchTransaction();
  }, [handleFetchTransaction]);

  const sidebar = useMemo(() => {
    if (!isAdmin) return null;
    return (
      <LazyAppSidebar
        userData={profile}
        teamMemberProfile={teamMemberProfile}
      />
    );
  }, [isAdmin]);

  const backgroundImage = useMemo(() => {
    if (isAdmin) return null;
    return (
      <div className="absolute inset-0 -z-10">
        <Image
          src="/assets/bg-primary.jpeg"
          alt="Background"
          quality={100}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-zinc-900/80 dark:bg-zinc-900/90"></div>
      </div>
    );
  }, [isAdmin]);

  const mobileNav = useMemo(() => {
    if (isAdmin) return null;
    return <MobileNavBar />;
  }, [isAdmin]);

  return (
    <div className="flex min-h-screen w-full overflow-hidden relative">
      {sidebar}

      <div className="flex-1 flex flex-col overflow-x-auto relative">
        {isAdmin && (
          <div className="p-4 md:hidden">
            <SidebarTrigger />
          </div>
        )}

        {backgroundImage}

        <div className="pb-24 p-4 relative z-50 grow">{children}</div>

        {mobileNav}

        {isAdmin && <ModeToggle />}

        <DevMode />
      </div>
    </div>
  );
}
