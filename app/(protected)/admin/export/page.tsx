import AdminExportPage from "@/components/AdminExportPage/AdminExportPage";
import { protectionAdminUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Export",
  description: "Export Page",
  openGraph: {
    url: "/admin/export",
  },
};

const Page = async () => {
  const { teamMemberProfile } = await protectionAdminUser();

  if (!teamMemberProfile) return redirect("/auth/login");

  return <AdminExportPage />;
};

export default Page;
