import WithdrawalHistoryPage from "@/components/WithrawalHistoryPage/WithdrawalHistoryPage";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Withdraw History",
  description: "Withdrawal History Page",
  openGraph: {
    url: "/withdraw/history",
  },
};

const Page = async () => {
  const result = await protectionMemberUser();

  if (result.redirect) {
    redirect(result.redirect);
  }
  return <WithdrawalHistoryPage />;
};

export default Page;
