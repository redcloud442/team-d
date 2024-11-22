import LegionBountyPage from "@/components/LegionBountyPage/LegionBountyPage";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Legion Bounty",
  description: "Legion Bounty Page",
  openGraph: {
    url: "/legion-bounty",
  },
};

const Page = async () => {
  const result = await protectionMemberUser();

  if (result.redirect) {
    redirect(result.redirect);
  }
  return <LegionBountyPage />;
};

export default Page;
