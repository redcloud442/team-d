import DashboardPage from "@/components/DashboardPage/DashboardPage";
import { getDashboardEarnings } from "@/services/Dasboard/Member";
import prisma from "@/utils/prisma";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { createClientServerSide } from "@/utils/supabase/server";
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
  const supabase = await createClientServerSide();
  const {
    redirect: redirectTo,
    earnings,
    referal,
    teamMemberProfile,
  } = await protectionMemberUser();

  if (redirectTo) {
    redirect(redirectTo);
  }

  if (!earnings || !teamMemberProfile) return redirect("/500");

  const packages = await prisma.package_table.findMany({
    where: {
      package_is_disabled: false,
    },
  });

  if (teamMemberProfile.alliance_member_role === "ADMIN")
    return redirect("/admin");

  const dashboardEarnings = await getDashboardEarnings(supabase, {
    teamMemberId: teamMemberProfile.alliance_member_id,
  });

  return (
    <DashboardPage
      teamMemberProfile={teamMemberProfile}
      referal={referal}
      dashboardEarnings={dashboardEarnings}
      earnings={earnings}
      packages={packages}
    />
  );
};

export default Page;
