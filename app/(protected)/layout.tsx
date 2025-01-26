// AppLayout.tsx
import LayoutContent from "@/components/LayoutComponents/LayoutContent";
import { ThemeProvider } from "@/components/theme-provider/theme-provider";

import { SidebarProvider } from "@/components/ui/sidebar";
import { RoleProvider } from "@/utils/context/roleContext";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    profile,
    redirect: redirectTo,
    teamMemberProfile,
  } = await protectionMemberUser();

  if (redirectTo) {
    redirect(redirectTo);
  }

  if (!profile) {
    redirect("/500");
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <SidebarProvider>
        <RoleProvider
          initialRole={teamMemberProfile.alliance_member_role}
          initialUserName={profile.user_username ?? ""}
        >
          <LayoutContent
            profile={profile}
            teamMemberProfile={teamMemberProfile}
          >
            {children}
          </LayoutContent>
        </RoleProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
