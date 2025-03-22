import WithdrawalPage from "@/components/WithdrawalPage/WithdrawalPage";
import prisma from "@/utils/prisma";
import { protectionAccountingUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Withdrawal Records",
  description: "List of Withdrawal Records",
  openGraph: {
    url: "/withdrawal",
  },
};

const Page = async () => {
  const { teamMemberProfile } = await prisma.$transaction(async (tx) => {
    return await protectionAccountingUser(tx);
  });

  if (!teamMemberProfile) return redirect("/500");

  return <WithdrawalPage />;
};

export default Page;
