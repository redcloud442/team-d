import TopUpHistoryPage from "@/components/TopUpHistoryPage/TopUpHistoryPage";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Top Up History",
  description: "Top Up History Page",
  openGraph: {
    url: "/top-up",
  },
};

const Page = async () => {
  const result = await protectionMemberUser();

  if (result.redirect) {
    redirect(result.redirect);
  }

  return <TopUpHistoryPage />;
};

export default Page;
