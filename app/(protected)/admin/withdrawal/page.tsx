import AdminWithdrawalHistoryPage from "@/components/AdminWithdrawalListPage/AdminWithdrawalPage";
import prisma from "@/utils/prisma";
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
  const { teamMemberProfile } = await prisma.$transaction(async (tx) => {
    return await protectionAdminUser(tx);
  });

  if (!teamMemberProfile) return redirect("/auth/login");

  return <AdminWithdrawalHistoryPage />;
};

export default Page;
