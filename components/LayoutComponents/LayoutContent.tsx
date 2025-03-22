"use client";

import MobileNavBar from "@/components/ui/MobileNavBar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
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
import { ROLE } from "@/utils/constant";
import { useRole } from "@/utils/context/roleContext";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useCallback, useEffect, useMemo } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import DevMode from "../ui/dev-mode";
import { Separator } from "../ui/separator";
import { AppSidebar } from "../ui/side-bar";
import { ModeToggle } from "../ui/toggleDarkmode";

type LayoutContentProps = {
  children: React.ReactNode;
};

export default function LayoutContent({ children }: LayoutContentProps) {
  const { teamMemberProfile } = useRole();
  const { setTheme } = useTheme();
  const { setTotalEarnings } = useUserDashboardEarningsStore();
  const { setEarnings } = useUserEarningsStore();
  const { setLoading } = useUserLoadingStore();
  const { setChartData } = usePackageChartData();
  const { setIsWithdrawalToday, setCanUserDeposit } =
    useUserHaveAlreadyWithdraw();
  const { setSponsor } = useSponsorStore();
  const { setDailyTask } = useDailyTaskStore();

  const isAdmin = useMemo(
    () => teamMemberProfile.alliance_member_role === ROLE.ADMIN,
    [teamMemberProfile.alliance_member_role]
  );
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);

  useEffect(() => {
    if (!isAdmin) {
      setTheme("dark");
    }
  }, [isAdmin, setTheme]);

  const handleFetchTransaction = useCallback(async () => {
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
        getUserSponsor({ userId: teamMemberProfile.alliance_member_user_id }),
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
    teamMemberProfile.alliance_member_user_id,
    setLoading,
  ]);

  useEffect(() => {
    if (!isAdmin) {
      handleFetchTransaction();
    }
  }, [isAdmin, handleFetchTransaction]);

  const sidebar = useMemo(() => {
    if (!isAdmin) return null;
    return <AppSidebar />;
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

  const breadcrumbs = useMemo(() => {
    return pathSegments.map((segment, i) => {
      const href = "/" + pathSegments.slice(0, i + 1).join("/");
      return {
        label: decodeURIComponent(segment)
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        href,
        isCurrentPage: i === pathSegments.length - 1,
      };
    });
  }, [pathSegments]);

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen w-full overflow-hidden relative">
        <div className="flex-1 flex flex-col overflow-x-auto relative">
          {backgroundImage}

          <div className="pb-24 p-4 relative z-50 grow">{children}</div>

          {mobileNav}

          <DevMode />
        </div>
      </div>
    );
  } else {
    return (
      <SidebarProvider>
        {sidebar}
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.href}>
                      <BreadcrumbItem
                        className={
                          index !== breadcrumbs.length - 1
                            ? "hidden md:block"
                            : ""
                        }
                      >
                        {crumb.isCurrentPage ? (
                          <BreadcrumbPage>
                            {crumb.label === "Admin"
                              ? "Dashboard"
                              : crumb.label}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link href={crumb.href}>
                              {crumb.label === "Admin"
                                ? "Dashboard"
                                : crumb.label}
                            </Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && (
                        <BreadcrumbSeparator className="hidden md:block" />
                      )}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="pb-24 p-4 relative z-50 grow">{children}</div>
          <ModeToggle />
        </SidebarInset>
      </SidebarProvider>
    );
  }
}
