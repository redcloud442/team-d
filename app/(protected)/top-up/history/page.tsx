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
  const { teamMemberProfile, redirect: redirectTo } =
    await protectionMemberUser();

  if (redirectTo) {
    redirect(redirectTo);
  }

  if (!teamMemberProfile) redirect("/500");

  return <TopUpHistoryPage teamMemberProfile={teamMemberProfile} />;
};

export default Page;
