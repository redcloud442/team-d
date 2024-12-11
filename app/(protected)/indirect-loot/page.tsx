import LegionBountyPage from "@/components/LegionBountyPage/LegionBountyPage";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Legion Bounty",
  description: "Legion Bounty Page",
  openGraph: {
    url: "/indirect-loot",
  },
};

const Page = async () => {
  const { redirect: redirectTo, teamMemberProfile } =
    await protectionMemberUser();

  if (redirectTo) {
    redirect(redirectTo);
  }

  if (!teamMemberProfile) return redirect("/500");

  return <LegionBountyPage teamMemberProfile={teamMemberProfile} />;
};

export default Page;
