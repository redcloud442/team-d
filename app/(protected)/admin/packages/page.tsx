import AdminPackagesPage from "@/components/AdminPackagesPage/AdminPackagesPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Packages",
  description: "List of Packages",
  openGraph: {
    url: "/admin/packages",
  },
};

const Page = async () => {
  return <AdminPackagesPage />;
};

export default Page;
