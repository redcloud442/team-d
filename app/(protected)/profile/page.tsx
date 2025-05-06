import UserProfilePage from "@/components/UserProfilePage/UserProfilePage";
import prisma from "@/utils/prisma";
import { protectionMemberUser } from "@/utils/serversideProtection";
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
  const {
    teamMemberProfile,
    profile,
    redirect: redirectTo,
  } = await protectionMemberUser();

  if (redirectTo || !teamMemberProfile) {
    return { redirect: redirectTo };
  }

  const earningsSummary = await prisma.dashboard_earnings_summary.findUnique({
    where: {
      member_id: teamMemberProfile.company_member_id,
    },
  });

  if (redirectTo) {
    redirect(redirectTo);
  }

  if (!teamMemberProfile || !profile) {
    redirect("/500");
  }

  const combinedData = {
    ...teamMemberProfile,
    ...profile,
    ...earningsSummary,
  } as UserRequestdata;

  return <UserProfilePage userProfile={combinedData} />;
};

export default Page;
