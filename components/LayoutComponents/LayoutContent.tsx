"use client";

import MobileNavBar from "@/components/ui/MobileNavBar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ROLE } from "@/utils/constant";
import { useRole } from "@/utils/context/roleContext";
import { alliance_member_table, user_table } from "@prisma/client";
import Image from "next/image";
import { useEffect } from "react";
import AppSidebar from "../ui/side-bar";
import { ModeToggle } from "../ui/toggleDarkmode";

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
  useEffect(() => {
    const htmlElement = document.documentElement;

    if (role !== ROLE.ADMIN) {
      localStorage.removeItem("theme");
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }
  }, [role]);

  return (
    <div className="flex min-h-screen w-full overflow-hidden relative">
      {role === ROLE.ADMIN && (
        <div>
          <AppSidebar
            userData={profile}
            teamMemberProfile={teamMemberProfile}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-x-auto relative">
        {role === ROLE.ADMIN && (
          <div className="p-4 md:hidden">
            <SidebarTrigger />
          </div>
        )}

        {role !== ROLE.ADMIN && (
          <div className="absolute inset-0 -z-10">
            {/* Background Image */}
            <Image
              src="/assets/bg-primary.jpeg"
              alt="Background"
              quality={100}
              fill
              priority
              className="object-cover"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-zinc-900/80 dark:bg-zinc-900/90"></div>
          </div>
        )}

        {/* Content Section */}
        <div className="pb-24 p-4 relative z-50 flex-grow">{children}</div>

        {/* Mobile Navigation */}
        {role !== ROLE.ADMIN && <MobileNavBar />}
        {role === ROLE.ADMIN && <ModeToggle />}
      </div>
    </div>
  );
}
