// AppLayout.tsx
import LayoutContent from "@/components/LayoutComponents/LayoutContent";
import { ThemeProvider } from "@/components/theme-provider/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RoleProvider } from "@/utils/context/roleContext";
import { protectionMemberUser } from "@/utils/serversideProtection";
import {
  company_member_table,
  company_referral_link_table,
  user_table,
} from "@prisma/client";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let profile = null;
  let redirectTo = null;
  let teamMemberProfile = null;
  let referral = null;

  try {
    const result = await protectionMemberUser();
    profile = result.profile;
    redirectTo = result.redirect;
    teamMemberProfile = result.teamMemberProfile;
    referral = result.referral;
  } catch (err) {
    redirect(redirectTo ?? "/500");
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <SidebarProvider>
        <RoleProvider
          initialProfile={profile as user_table}
          initialTeamMemberProfile={
            teamMemberProfile as company_member_table & user_table
          }
          initialReferral={referral as company_referral_link_table}
        >
          <LayoutContent>{children}</LayoutContent>
        </RoleProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
