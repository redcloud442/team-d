import AdminWithdrawalHistoryPage from "@/components/AdminWithdrawalListPage/AdminWithdrawalPage";
import { protectionAdminUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Withdrawal Records",
  description: "List of Withdrawal Records",
  openGraph: {
    url: "/admin/withdrawal",
  },
};

const Page = async () => {
  const { teamMemberProfile } = await protectionAdminUser();

  if (!teamMemberProfile) return redirect("/500");

  return <AdminWithdrawalHistoryPage teamMemberProfile={teamMemberProfile} />;
};

export default Page;
