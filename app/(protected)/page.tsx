import DashboardPage from "@/components/DashboardPage/DashboardPage";
import prisma from "@/utils/prisma";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "List of records",
  openGraph: {
    url: "/",
  },
};

const Page = async () => {
  const { teamMemberProfile, redirect: redirectTo } =
    await protectionMemberUser();

  if (redirectTo) {
    redirect(redirectTo);
  }

  if (!teamMemberProfile) {
    redirect("/500");
  }

  const earnings = await prisma.alliance_earnings_table.findFirst({
    where: {
      alliance_earnings_member_id: teamMemberProfile.alliance_member_id,
    },
  });

  const safeEarnings = earnings || {
    alliance_earnings_member_id: teamMemberProfile.alliance_member_id,
    alliance_earnings_id: "",
    alliance_ally_bounty: 0,
    alliance_legion_bounty: 0,
    alliance_olympus_earnings: 0,
  };

  return <DashboardPage earnings={safeEarnings} />;
};

export default Page;
