import AdminTopUpApprovalPage from "@/components/AdminTopUpApprovalPage/AdminTopUpApprovalPage";
import prisma from "@/utils/prisma";
import { protectionAdminUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Deposit Records",
  description: "List of Deposit Records",
  openGraph: {
    url: "/admin/deposit",
  },
};

const Page = async () => {
  const { teamMemberProfile } = await prisma.$transaction(async (tx) => {
    return await protectionAdminUser(tx);
  });

  if (!teamMemberProfile) return redirect("/auth/login");

  return <AdminTopUpApprovalPage />;
};

export default Page;
