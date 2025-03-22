import AdminDashboardPage from "@/components/AdminDashboardPage/AdminDashboardPage";
import { protectionAdminUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "List of Withdrawal Records",
  openGraph: {
    url: "/admin",
  },
};

const Page = async () => {
  const { teamMemberProfile } = await protectionAdminUser();

  if (!teamMemberProfile) return redirect("/auth/login");

  return <AdminDashboardPage />;
};

export default Page;
