import AdminExportPage from "@/components/AdminExportPage/AdminExportPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Export",
  description: "Export Page",
  openGraph: {
    url: "/admin/export",
  },
};

const Page = async () => {
  return <AdminExportPage />;
};

export default Page;
