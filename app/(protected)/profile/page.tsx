import UserProfilePageUser from "@/components/UserProfilePage/UserProfilePageUser";
import prisma from "@/utils/prisma";
import { createClientServerSide } from "@/utils/supabase/server";
import { UserRequestdata } from "@/utils/types";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Profile Page",
  description: "User Profile Page",
  openGraph: {
    url: "/profile",
  },
};

const Page = async () => {
  const supabase = await createClientServerSide();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/access/signin");
  }

  const earningsSummary = await prisma.dashboard_earnings_summary.findFirst({
    where: {
      member_id: user.user_metadata.CompanyMemberId,
    },
  });

  if (!earningsSummary) {
    redirect("/500");
  }

  const teamMemberProfile = await prisma.company_member_table.findUnique({
    where: {
      company_member_id: user.user_metadata.CompanyMemberId,
    },
  });

  if (!teamMemberProfile) {
    redirect("/500");
  }

  const profile = await prisma.user_table.findUnique({
    where: {
      user_id: teamMemberProfile.company_member_user_id,
    },
  });

  const combinedData = {
    ...teamMemberProfile,
    ...profile,
    ...earningsSummary,
  } as UserRequestdata;

  return <UserProfilePageUser userProfile={combinedData} />;
};

export default Page;
