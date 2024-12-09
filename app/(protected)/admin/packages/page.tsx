import AdminPackagesPage from "@/components/AdminPackagesPage/AdminPackagesPage";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Packages",
  description: "List of Packages",
  openGraph: {
    url: "/admin/packages",
  },
};

const Page = async () => {
  const { teamMemberProfile } = await protectionMemberUser();

  if (!teamMemberProfile) return redirect("/500");

  return <AdminPackagesPage teamMemberProfile={teamMemberProfile} />;
};

export default Page;
