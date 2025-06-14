import LayoutContent from "@/components/LayoutComponents/LayoutContent";
import { ThemeProvider } from "@/components/theme-provider/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RoleProvider } from "@/utils/context/roleContext";
import { createClientServerSide } from "@/utils/supabase/server";
import {
  company_member_table,
  company_referral_link_table,
  user_table,
} from "@/utils/types";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "DIGIWEALTH",
  description: "Step into Digi Wealth — Your path to digital prosperity.",
  openGraph: {
    title: "DIGIWEALTH",
    description: "Step into Digi Wealth — Your path to digital prosperity.",
    url: "https://www.digi-wealth.vip",
    siteName: "DIGIWEALTH",
    images: [
      {
        url: "https://www.digi-wealth.vip/assets/icons/iconGif.webp",
        width: 1200,
        height: 630,
        alt: "DIGIWEALTH",
      },
    ],
    type: "website",
  },
};

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
          <LayoutContent>{children}</LayoutContent>
        </RoleProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
