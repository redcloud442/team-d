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
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { createClientSide } from "@/utils/supabase/client";
import { alliance_member_table, user_table } from "@prisma/client";
import {
  BanknoteIcon,
  BeakerIcon,
  Calendar,
  ChevronDown,
  ChevronUp,
  Group,
  HistoryIcon,
  Home,
  Inbox,
  Package,
  PiggyBankIcon,
  Settings,
  User2,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import NavigationLoader from "./NavigationLoader";

type Props = {
  userData: user_table;
  teamMemberProfile: alliance_member_table;
};

const AppSidebar = ({ userData, teamMemberProfile }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientSide();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(
    teamMemberProfile.alliance_member_role === "ADMIN"
  );
  const { setOpenMobile } = useSidebar();

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      router.refresh();
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = useMemo(() => {
    const baseItems = [
      { title: "Home", url: "/", icon: Home },
      {
        title: "Top Up",
        url: "/top-up",
        icon: Inbox,
        subItems: [
          {
            icon: HistoryIcon,
            title: "Top Up History",
            url: "/top-up/history",
          },
        ],
      },
      { title: "Packages", url: "/packages", icon: Calendar },
      {
        title: "Withdraw",
        url: "/withdraw",
        icon: PiggyBankIcon,
        subItems: [
          {
            icon: BanknoteIcon,
            title: "Withdrawal History",
            url: "/withdraw/history",
          },
        ],
      },
      { title: "Ally Bounty", url: "/ally-bounty", icon: User2 },
      { title: "Legion Bounty", url: "/legion-bounty", icon: Group },
    ];

    if (teamMemberProfile.alliance_member_role === "MERCHANT") {
      baseItems.push({
        title: "Top Up History",
        url: "/admin/top-up",
        icon: HistoryIcon,
      });
    }

    return baseItems;
  }, [teamMemberProfile.alliance_member_role]);

  const adminMenuItems = [
    { title: "Admin Dashboard", url: "/admin", icon: Settings },
    { title: "Packages", url: "/admin/packages", icon: Package },
    { title: "Manage Users", url: "/admin/users", icon: User2 },
    { title: "Top Up History", url: "/admin/top-up", icon: HistoryIcon },
    { title: "Withdrawal History", url: "/admin/withdrawal", icon: BeakerIcon },
  ];

  useEffect(() => {
    setIsAdmin(teamMemberProfile.alliance_member_role === "ADMIN");
  }, [teamMemberProfile.alliance_member_role]);

  const handleNavigation = (url: string) => {
    if (pathname !== url) {
      setIsLoading(true);
      setOpenMobile(false);
      router.push(url);
    }
  };

  const isActive = (url: string) => pathname === url;

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  const renderMenu = (menu: typeof menuItems) =>
    menu.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          size="lg"
          onClick={() => handleNavigation(item.url)}
          className={`flex items-center px-4 py-4 rounded-md ${
            isActive(item.url)
              ? "bg-blue-100 text-blue-500 font-bold"
              : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
          }`}
        >
          <item.icon className="w-5 h-5" />
          <span>{item.title}</span>
        </SidebarMenuButton>
        {item.subItems && (
          <SidebarMenuSub>
            {item.subItems.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton
                  size="sm"
                  onClick={() => handleNavigation(subItem.url)}
                  className={`flex cursor-pointer items-center px-4 py-2 rounded-md ${
                    isActive(subItem.url)
                      ? "bg-blue-50 text-blue-500 font-semibold"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <subItem.icon className="w-4 h-4" />
                  <span>{subItem.title}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    ));

  return (
    <>
      <NavigationLoader visible={isLoading} />
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                ALLIANCE 1
                <ChevronDown className="ml-auto" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Application Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenu>
                  {renderMenu(isAdmin ? adminMenuItems : menuItems)}
                </SidebarMenu>
              </SidebarMenu>
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
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
};

export default AppSidebar;
