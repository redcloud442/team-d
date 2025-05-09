import AdminUserMonitoringPage from "@/components/AdminUserMonitoringPage/AdminUserMonitoringPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monitoring",
  description: "Monitoring",
  openGraph: {
    url: "/admin/monitoring",
  },
};

const Page = async () => {
  return <AdminUserMonitoringPage />;
};

export default Page;
