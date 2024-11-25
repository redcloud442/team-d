import WithdrawalPage from "@/components/WithdrawPage/WithdrawPage";
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
  const {
    redirect: redirectTo,
    teamMemberProfile,
    earnings,
  } = await protectionMemberUser();

  if (redirectTo) {
    redirect(redirectTo);
  }

  if (!teamMemberProfile) redirect("/500");

  if (!earnings) redirect("/500");

  return (
    <WithdrawalPage teamMemberProfile={teamMemberProfile} earnings={earnings} />
  );
};

export default Page;
