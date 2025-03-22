import AdminWheelManagementPage from "@/components/AdminWheelManagementPage/AdminWheelManagementPage";
import prisma from "@/utils/prisma";
import { protectionAdminUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Wheel Management",
  description: "Wheel Management",
  openGraph: {
    url: "/admin/wheel-management",
  },
};

const Page = async () => {
  const { teamMemberProfile } = await protectionAdminUser();

  if (!teamMemberProfile) return redirect("/auth/login");

  const wheelSettings = await prisma.alliance_wheel_settings_table.findMany({
    orderBy: {
      alliance_wheel_settings_date: "desc",
    },
  });

  return <AdminWheelManagementPage wheelSettings={wheelSettings} />;
};

export default Page;
