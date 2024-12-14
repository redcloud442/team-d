// LayoutContent.tsx
"use client";

import MobileNavBar from "@/components/ui/MobileNavBar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/ui/toggleDarkmode";
import { useRole } from "@/utils/context/roleContext";
import { alliance_member_table, user_table } from "@prisma/client";
import NavBar from "../ui/navBar";
import AppSidebar from "../ui/side-bar";

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

  return (
    <div className="flex min-h-screen h-full w-full overflow-auto">
      {role === "ADMIN" && (
        <div>
          <AppSidebar
            userData={profile}
            teamMemberProfile={teamMemberProfile}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-x-auto">
        {role === "ADMIN" && (
          <div className="p-4 md:hidden">
            <SidebarTrigger />
          </div>
        )}

        {role !== "ADMIN" && (
          <div className="hidden md:block">
            <NavBar teamMemberProfile={teamMemberProfile} />
          </div>
        )}

        <div className="p-4 pb-10 md:pb-0">{children}</div>
        <ModeToggle />

        {role !== "ADMIN" && <MobileNavBar />}
      </div>
    </div>
  );
}
