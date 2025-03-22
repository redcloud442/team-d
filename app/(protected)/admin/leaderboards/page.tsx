import AdminLeaderBoardsPage from "@/components/AdminLeaderBoardsPage/AdminLeaderBoardsPage";
import prisma from "@/utils/prisma";
import { protectionAdminUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Packages",
  description: "List of Packages",
  openGraph: {
    url: "/admin/leaderboards",
  },
};

const Page = async () => {
  const { teamMemberProfile } = await prisma.$transaction(async (tx) => {
    return await protectionAdminUser(tx);
  });

  if (!teamMemberProfile) return redirect("/auth/login");

  return <AdminLeaderBoardsPage />;
};

export default Page;
