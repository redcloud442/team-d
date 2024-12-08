import AdminPackagesPage from "@/components/AdminPackagesPage/AdminPackagesPage";
import { protectionMemberUser } from "@/utils/serversideProtection";
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
  const { teamMemberProfile } = await protectionMemberUser();

  if (!teamMemberProfile) return redirect("/500");

  return <AdminPackagesPage />;
};

export default Page;
