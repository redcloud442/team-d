import AdminUserMonitoringPage from "@/components/AdminUserMonitoringPage/AdminUserMonitoringPage";
import prisma from "@/utils/prisma";
import { protectionAdminUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Monitoring",
  description: "Monitoring",
  openGraph: {
    url: "/admin/monitoring",
  },
};

const Page = async () => {
  const { teamMemberProfile } = await prisma.$transaction(async (tx) => {
    return await protectionAdminUser(tx);
  });

  if (!teamMemberProfile) return redirect("/auth/login");

  return <AdminUserMonitoringPage />;
};

export default Page;
