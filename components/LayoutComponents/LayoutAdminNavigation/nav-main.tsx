"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
      icon?: LucideIcon;
    }[];
  }[];
}) {
  const pathname = usePathname();

  const isActive = (url: string) => pathname === url;
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Application Menu</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon className="text-orange-400" />}
                  <span className="text-md text-orange-400">{item.title}</span>
                  <ChevronRight
                    size={20}
                    className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-orange-400"
                  />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem
                      key={subItem.title}
                      className={`${isActive(subItem.url) ? "bg-orange-400/50 rounded-md" : ""}`}
                    >
                      <Link href={subItem.url}>
                        <Button
                          variant="ghost"
                          className="hover:bg-transparent w-full text-start flex justify-start gap-2"
                          size="sm"
                        >
                          {subItem.icon && (
                            <subItem.icon className="text-orange-400" />
                          )}
                          {subItem.title}
                        </Button>
                      </Link>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
