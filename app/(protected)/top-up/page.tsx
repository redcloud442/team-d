import TopUpPage from "@/components/TopUpPage/TopUpPage";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Top Up",
  description: "Top Up Page",
  openGraph: {
    url: "/top-up",
  },
};

const Page = async () => {
  const { teamMemberProfile, redirect: redirectTo } =
    await protectionMemberUser();

  if (redirectTo) redirect(redirectTo);

  if (!teamMemberProfile) redirect("/");

  return <TopUpPage teamMemberProfile={teamMemberProfile} />;
};

export default Page;
