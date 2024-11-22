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
} from "@/components/ui/sidebar";
import { createClientSide } from "@/utils/supabase/client";
import { user_table } from "@prisma/client";
import {
  BanknoteIcon,
  Calendar,
  ChevronDown,
  ChevronUp,
  HistoryIcon,
  Home,
  Inbox,
  Search,
  Settings,
  User2,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NavigationLoader from "./NavigationLoader";

type Props = {
  userData: user_table;
};

const items = [
  { title: "Home", url: "/", icon: Home },
  {
    title: "Top Up",
    url: "/top-up",
    icon: Inbox,
    subItems: [
      { icon: HistoryIcon, title: "Top Up History", url: "/top-up/history" },
    ],
  },
  { title: "Packages", url: "/packages", icon: Calendar },
  {
    title: "Withdraw",
    url: "/withdraw",
    icon: Search,
    subItems: [
      {
        icon: BanknoteIcon,
        title: "Withdrawal History",
        url: "/withdraw/history",
      },
    ],
  },
  { title: "Ally Bounty", url: "/ally-bounty", icon: Settings },
  { title: "Legion Bounty", url: "/legion-bounty", icon: Settings },
];

const AppSidebar = ({ userData }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientSide();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  const handleNavigation = (url: string) => {
    if (pathname !== url) {
      setIsLoading(true);
      router.push(url);
    }
  };

  const isActive = (url: string) => pathname === url;

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
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      size="lg"
                      onClick={() => handleNavigation(item.url)}
                      className={`flex text-md items-center space-x-2 px-4 py-4 rounded-md ${
                        isActive(item.url)
                          ? "bg-blue-100 text-blue-500 font-bold"
                          : "hover:bg-gray-100 text-gray-800"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {item.subItems && (
                      <SidebarMenuSub>
                        {item.subItems.map((subItem) => (
                          <SidebarMenuSubItem
                            className="cursor-pointer"
                            key={subItem.title}
                          >
                            <SidebarMenuSubButton
                              size="md"
                              onClick={() => handleNavigation(subItem.url)}
                              className={`flex cursor-pointer text-md items-center space-x-2 px-4 py-2 rounded-md ${
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
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleSignOut}>
                <div className="flex items-center space-x-2 w-full">
                  <User2 className="w-5 h-5" />
                  <span className="truncate">{userData.user_email}</span>
                  <ChevronUp className="ml-auto w-4 h-4" />
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
};

export default AppSidebar;
