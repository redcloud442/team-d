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
  const {
    redirect: redirectTo,
    earnings,
    referal,
    teamMemberProfile,
  } = await protectionMemberUser();

  if (redirectTo) {
    redirect(redirectTo);
  }

  if (!earnings || !referal || !teamMemberProfile) return redirect("/500");

  const packages = await prisma.package_table.findMany();

  return (
    <DashboardPage
      teamMemberProfile={teamMemberProfile}
      referal={referal}
      earnings={earnings}
      packages={packages}
    />
  );
};

export default Page;
