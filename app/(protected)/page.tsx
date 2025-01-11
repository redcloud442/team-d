import DashboardPage from "@/components/DashboardPage/DashboardPage";
import prisma from "@/utils/prisma";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Pr1me Dashboard",
  openGraph: {
    url: "/",
  },
};

const Page = async () => {
  const {
    redirect: redirectTo,
    earnings,
    referal,
    teamMemberProfile,
    profile,
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

  return (
    <DashboardPage
      profile={profile}
      teamMemberProfile={teamMemberProfile}
      referal={referal}
      earnings={earnings}
      packages={packages}
    />
  );
};

export default Page;
