import AdminTopUpApprovalPage from "@/components/AdminTopUpApprovalPage/AdminTopUpApprovalPage";
import { protectionAdminUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Top Up Records",
  description: "List of Top Up Records",
  openGraph: {
    url: "/admin/top-up",
  },
};

const Page = async () => {
  const { teamMemberProfile } = await protectionAdminUser();

  if (!teamMemberProfile) return redirect("/500");

  return <AdminTopUpApprovalPage teamMemberProfile={teamMemberProfile} />;
};

export default Page;
