"use client";

import MobileNavBar from "@/components/ui/MobileNavBar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getDashboard } from "@/services/Dasboard/Member";
import { getUserWithdrawalToday } from "@/services/User/User";
import { useUserLoadingStore } from "@/store/useLoadingStore";
import { usePackageChartData } from "@/store/usePackageChartData";
import { useUserDashboardEarningsStore } from "@/store/useUserDashboardEarnings";
import { useUserEarningsStore } from "@/store/useUserEarningsStore";
import { useUserHaveAlreadyWithdraw } from "@/store/useWithdrawalToday";
import { ROLE } from "@/utils/constant";
import { useRole } from "@/utils/context/roleContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTheme } from "next-themes";
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
import { Separator } from "../ui/separator";
import { AppSidebar } from "../ui/side-bar";
import { ModeToggle } from "../ui/toggleDarkmode";
import TopNavigation from "../ui/top-navigation";

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

  const queryClient = new QueryClient();

  const isAdmin = useMemo(
    () => teamMemberProfile.company_member_role === ROLE.ADMIN,
    [teamMemberProfile.company_member_role]
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

      const [dashboardData, { totalEarnings, userEarningsData, actions }] =
        await Promise.all([
          getDashboard({ teamMemberId: teamMemberProfile.company_member_id }),
          getUserWithdrawalToday(),
        ]);

      const { canWithdrawReferral, canWithdrawPackage, canUserDeposit } =
        actions;
      setTotalEarnings(totalEarnings);
      setEarnings(userEarningsData);
      setChartData(dashboardData);
      setCanUserDeposit(canUserDeposit);
      setIsWithdrawalToday({
        referral: canWithdrawReferral,
        package: canWithdrawPackage,
      });
    } catch (e) {
      console.error("Failed to fetch transaction data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      handleFetchTransaction();
    }
  }, [isAdmin]);

  const sidebar = useMemo(() => {
    if (!isAdmin) return null;
    return <AppSidebar />;
  }, [isAdmin]);

  const mobileNav = useMemo(() => {
    if (isAdmin) return null;
    return <MobileNavBar />;
  }, [isAdmin]);

  const topNav = useMemo(() => {
    if (isAdmin) return null;
    return <TopNavigation />;
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
      <QueryClientProvider client={queryClient}>
        <div className="flex min-h-screen w-full overflow-hidden relative">
          <div className="flex-1 flex flex-col overflow-x-auto relative">
            {topNav}

            <div className="p-4 relative grow bg-bg-primary">
              <div className="relative z-10 pb-24">{children}</div>
            </div>

            {mobileNav}

            {/* <DevMode /> */}
          </div>
        </div>
      </QueryClientProvider>
    );
  } else {
    return (
      <SidebarProvider>
        {sidebar}
        <SidebarInset className="overflow-x-auto">
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-bg-primary">
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
          <div className="pb-24 p-4 relative z-50 grow bg-bg-primary">
            {children}
          </div>
          <ModeToggle />
        </SidebarInset>
      </SidebarProvider>
    );
  }
}
