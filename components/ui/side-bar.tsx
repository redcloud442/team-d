"use client";

import {
  BookOpen,
  File,
  HistoryIcon,
  ImageIcon,
  LayoutDashboardIcon,
  MonitorCheck,
  Package,
  PersonStandingIcon,
  ReceiptCentIcon,
  Settings2,
  SquareTerminal,
  Trophy,
  User,
  VideoIcon,
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/LayoutComponents/LayoutAdminNavigation/nav-main";
import { NavUser } from "@/components/LayoutComponents/LayoutAdminNavigation/nav-user";
import { TeamSwitcher } from "@/components/LayoutComponents/LayoutAdminNavigation/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRole } from "@/utils/context/roleContext";

const data = {
  teams: [
    {
      name: "DIGIWEALTH",
      logo: "/assets/icons/IconGif.webp",
      plan: "Company",
    },
  ],
  navMain: [
    {
      title: "Analytics",
      url: "/admin",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/admin",
          icon: LayoutDashboardIcon,
        },
        {
          title: "Leaderboard",
          url: "/admin/leaderboards",
          icon: Trophy,
        },
      ],
    },
    {
      title: "User Management",
      url: "/admin/user",
      icon: PersonStandingIcon,
      isActive: true,
      items: [
        {
          title: "User",
          url: "/admin/users",
          icon: User,
        },
        {
          title: "Monitoring",
          url: "/admin/monitoring",
          icon: MonitorCheck,
        },
        {
          title: "Reinvestment",
          url: "/admin/users/reinvested",
          icon: File,
        },
      ],
    },
    {
      title: "Withdrawal",
      url: "/admin/withdrawal",
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: "History",
          url: "/admin/withdrawal",
          icon: File,
        },
        {
          title: "Report",
          url: "/admin/withdrawal/report",
          icon: ReceiptCentIcon,
        },
      ],
    },
    {
      title: "Deposit",
      url: "/admin/deposit",
      icon: HistoryIcon,
      isActive: true,
      items: [
        {
          title: "History",
          url: "/admin/deposit",
          icon: File,
        },
        {
          title: "Report",
          url: "/admin/deposit/report",
          icon: ReceiptCentIcon,
        },
      ],
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings2,
      isActive: true,
      items: [
        {
          title: "Package",
          url: "/admin/packages",
          icon: Package,
        },

        {
          title: "Export",
          url: "/admin/export",
          icon: File,
        },
        {
          title: "Banner",
          url: "/admin/banner",
          icon: ImageIcon,
        },
        {
          title: "Testimonials",
          url: "/admin/testimonials",
          icon: VideoIcon,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { profile } = useRole();
  const { setOpen } = useSidebar();
  return (
    <Sidebar
      onMouseEnter={() => setOpen(true)}
      className="border-none"
      collapsible="icon"
      {...props}
    >
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={profile} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
