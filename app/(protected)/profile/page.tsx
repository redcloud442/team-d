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
    earningsSummary,
  } = await prisma.$transaction(async (tx) => {
    const {
      teamMemberProfile,
      profile,
      redirect: redirectTo,
    } = await protectionMemberUser(tx);

    if (redirectTo || !teamMemberProfile) {
      return { redirect: redirectTo };
    }

    const earningsSummary = await tx.dashboard_earnings_summary.findFirst({
      where: {
        member_id: teamMemberProfile.alliance_member_id,
      },
    });

    return {
      teamMemberProfile,
      profile,
      redirect: redirectTo,
      earningsSummary,
    };
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
