import AllyBountyPage from "@/components/AllyBountyPage/AllyBountyPage";
import { protectionAdminUser } from "@/utils/serversideProtection";
import { createClientServerSide } from "@/utils/supabase/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";
export const metadata: Metadata = {
  title: "Direct Referral",
  description: "Direct Referral Page",
  openGraph: {
    url: "/direct-referral",
  },
};

const Page = async () => {
  const supabase = await createClientServerSide();
  const { teamMemberProfile } = await protectionAdminUser();
  let sponsor = "";
  if (!teamMemberProfile) return redirect("/500");

  const { data } = await supabase.rpc("get_direct_sponsor", {
    input_data: {
      teamMemberId: "",
    },
  });

  if (!data) {
    sponsor = "";
  } else {
    sponsor = data as string;
  }

  return (
    <AllyBountyPage teamMemberProfile={teamMemberProfile} sponsor={sponsor} />
  );
};

export default Page;
