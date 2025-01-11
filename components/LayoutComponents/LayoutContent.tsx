// LayoutContent.tsx
"use client";

import MobileNavBar from "@/components/ui/MobileNavBar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/ui/toggleDarkmode";
import { ROLE } from "@/utils/constant";
import { useRole } from "@/utils/context/roleContext";
import { alliance_member_table, user_table } from "@prisma/client";
import Image from "next/image";
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
      {role === ROLE.ADMIN && (
        <div>
          <AppSidebar
            userData={profile}
            teamMemberProfile={teamMemberProfile}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-x-auto">
        {role === ROLE.ADMIN && (
          <div className="p-4 md:hidden">
            <SidebarTrigger />
          </div>
        )}

        {/* {role !== ROLE.ADMIN && (
          <div className="hidden md:block">
            <NavBar />
          </div>
        )} */}

        <div className="p-4 relative min-h-screen h-full md:pb-0 z-50">
          {role !== ROLE.ADMIN && (
            <div className="absolute inset-0 -z-10">
              <Image
                src="/assets/bg-primary.jpeg"
                alt="Background"
                quality={100}
                fill
                priority
                style={{
                  objectFit: "cover",
                }}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-40" />
            </div>
          )}
          {children}
        </div>
        <ModeToggle />

        {role !== ROLE.ADMIN && <MobileNavBar />}
      </div>
    </div>
  );
}
