import AdminRafflePage from "@/components/AdminRafflePage/AdminRafflePage";
import { protectionAdminUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Raffle",
  description: "Raffle",
  openGraph: {
    url: "/admin/raffle",
  },
};

const Page = async () => {
  const { teamMemberProfile } = await protectionAdminUser();

  if (!teamMemberProfile) return redirect("/auth/login");

  return <AdminRafflePage />;
};

export default Page;
