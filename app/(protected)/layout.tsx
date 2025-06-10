import LayoutContent from "@/components/LayoutComponents/LayoutContent";
import { ThemeProvider } from "@/components/theme-provider/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleProvider } from "@/utils/context/roleContext";
import { createClientServerSide } from "@/utils/supabase/server";
import {
  company_member_table,
  company_referral_link_table,
  user_table,
} from "@/utils/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClientServerSide();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login");
  }

  const handleGetUser = async () => {
    const result = await fetch(
      `${process.env.API_URL}/api/v1/user/profile-data`,
      {
        method: "POST",
        headers: {
          cookie: (await cookies()).toString(),
        },
      }
    );

    if (!result.ok) {
      throw new Error("Failed to fetch user data");
    }

    const data = await result.json();
    console.log(data);
    const profile = data ?? null;
    const teamMemberProfile = data?.company_member_table?.[0] ?? null;
    const referral =
      data?.company_member_table?.[0]?.company_referral_link_table?.[0] ?? null;

    if (!profile || !teamMemberProfile || !referral) {
      throw new Error("Incomplete user data");
    }

    return { profile, teamMemberProfile, referral };
  };

  let profile: user_table | null = null;
  let teamMemberProfile: (company_member_table & user_table) | null = null;
  let referral: company_referral_link_table | null = null;

  try {
    const data = await handleGetUser();
    profile = data.profile;
    teamMemberProfile = data.teamMemberProfile;
    referral = data.referral;
  } catch (error) {
    redirect("/500");
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <SidebarProvider>
        <RoleProvider
          initialProfile={profile!}
          initialTeamMemberProfile={teamMemberProfile!}
          initialReferral={referral!}
        >
          <Suspense
            fallback={<Skeleton className="h-[calc(100vh-10rem)] w-full" />}
          >
            <LayoutContent>{children}</LayoutContent>
          </Suspense>
        </RoleProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
