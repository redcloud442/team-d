import WithdrawalPage from "@/components/WithdrawPage/WithdrawPage";
import prisma from "@/utils/prisma";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";
export const metadata: Metadata = {
  title: "Withdraw",
  description: "Withdrawal Page",
  openGraph: {
    url: "/withdraw",
  },
};

const Page = async () => {
  const { redirect: redirectTo, teamMemberProfile } =
    await protectionMemberUser();

  if (redirectTo) {
    redirect(redirectTo);
  }

  if (!teamMemberProfile) redirect("/500");

  const earnings = await prisma.alliance_earnings_table.findUnique({
    where: {
      alliance_earnings_member_id: teamMemberProfile.alliance_member_id,
    },
  });

  if (!earnings) redirect("/500");

  return (
    <WithdrawalPage teamMemberProfile={teamMemberProfile} earnings={earnings} />
  );
};

export default Page;
