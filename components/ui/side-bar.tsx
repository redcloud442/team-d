"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { createClientSide } from "@/utils/supabase/client";
import { alliance_member_table, user_table } from "@prisma/client";
import {
  BeakerIcon,
  ChevronUp,
  FerrisWheel,
  File,
  HistoryIcon,
  MonitorCheck,
  Package,
  ReceiptCentIcon,
  Settings,
  Trophy,
  User2,
  Video,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

type Props = {
  userData: user_table;
  teamMemberProfile: alliance_member_table;
};

const AppSidebar = ({ userData }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientSide();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (e) {
    } finally {
    }
  };

  const adminMenuItems = [
    { title: "Admin Dashboard", url: "/admin", icon: Settings },
    { title: "Leaderboards", url: "/admin/leaderboards", icon: Trophy },
    { title: "Packages", url: "/admin/packages", icon: Package },
    {
      title: "Manage Users",
      url: "/admin/users",
      icon: User2,
      subItems: [
        {
          icon: File,
          title: "User Reinvested",
          url: "/admin/users/reinvested",
        },
      ],
    },
    { title: "Deposit History", url: "/admin/deposit", icon: HistoryIcon },
    {
      title: "Withdrawal History",
      url: "/admin/withdrawal",
      icon: BeakerIcon,
      subItems: [
        {
          icon: File,
          title: "Withdrawal Report",
          url: "/admin/withdrawal/report",
        },
        {
          icon: ReceiptCentIcon,
          title: "Sales Report",
          url: "/admin/deposit/report",
        },
      ],
    },
    {
      title: "User Monitoring",
      url: "/admin/monitoring",
      icon: MonitorCheck,
    },
    {
      title: "Testimonials",
      url: "/admin/testimonials",
      icon: Video,
    },
    {
      title: "Wheel Management",
      url: "/admin/wheel-management",
      icon: FerrisWheel,
    },
  ];

  const isActive = (url: string) => pathname === url;

  const renderedMenu = useMemo(() => {
    return adminMenuItems.map((item) => (
      <SidebarMenuItem key={item.title}>
        <Link href={item.url}>
          <SidebarMenuButton
            size="lg"
            className={`flex items-center px-4 py-4 rounded-md ${
              isActive(item.url)
                ? "bg-blue-100 text-blue-500 font-bold"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.title}
          </SidebarMenuButton>
        </Link>
        {item.subItems && (
          <SidebarMenuSub>
            {item.subItems.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <Link href={subItem.url}>
                  <SidebarMenuButton
                    size="sm"
                    className={`flex cursor-pointer items-center px-4 py-2 rounded-md ${
                      isActive(subItem.url)
                        ? "bg-blue-50 text-blue-500 font-semibold"
                        : "hover:bg-gray-700 text-white-700"
                    }`}
                  >
                    <subItem.icon className="w-4 h-4" />
                    <span>{subItem.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    ));
  }, [pathname]);

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>PR1MEPH</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderedMenu}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <div className="flex items-center space-x-2 w-full">
                    <User2 className="w-5 h-5" />
                    <span className="truncate">{userData.user_username}</span>
                    <ChevronUp className="ml-auto w-4 h-4" />
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top">
                <Link href="/profile">
                  <DropdownMenuItem>
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={handleSignOut}>
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
