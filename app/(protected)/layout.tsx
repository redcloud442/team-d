// AppLayout.tsx
import LayoutContent from "@/components/LayoutComponents/LayoutContent";
import { ThemeProvider } from "@/components/theme-provider/theme-provider";

import { SidebarProvider } from "@/components/ui/sidebar";
import { RoleProvider } from "@/utils/context/roleContext";
import prisma from "@/utils/prisma";
import { protectionMemberUser } from "@/utils/serversideProtection";
import {
  alliance_member_table,
  alliance_referral_link_table,
  user_table,
} from "@prisma/client";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userProfile = await prisma.$transaction(async (tx) => {
    const {
      profile,
      redirect: redirectTo,
      teamMemberProfile,
      referral,
    } = await protectionMemberUser(tx);

    return { profile, redirectTo, teamMemberProfile, referral };
  });

  if (userProfile.redirectTo) {
    redirect(userProfile.redirectTo);
  }

  if (!userProfile.profile) {
    redirect("/500");
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <SidebarProvider>
        <RoleProvider
          initialProfile={userProfile.profile as user_table}
          initialTeamMemberProfile={
            userProfile.teamMemberProfile as alliance_member_table & user_table
          }
          initialReferral={userProfile.referral as alliance_referral_link_table}
        >
          <LayoutContent>{children}</LayoutContent>
        </RoleProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
