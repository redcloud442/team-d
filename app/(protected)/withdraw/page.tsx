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
  const result = await protectionMemberUser();

  if (result.redirect) {
    redirect(result.redirect);
  }
  return <WithdrawalPage />;
};

export default Page;
