import LegionBountyPage from "@/components/LegionBountyPage/LegionBountyPage";
import { protectionAllUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Indirect Referral",
  description: "Indirect Referral Page",
  openGraph: {
    url: "/indirect-referral",
  },
};

const Page = async () => {
  const { teamMemberProfile } = await protectionAllUser();

  if (!teamMemberProfile) return redirect("/500");

  if (!teamMemberProfile) {
    redirect("/");
  }

  return <LegionBountyPage teamMemberProfile={teamMemberProfile} />;
};

export default Page;
