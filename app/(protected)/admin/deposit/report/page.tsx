import AdminSalesReportPage from "@/components/AdminSalesReportPage/AdminSalesReportPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sales Report",
  description: "Sales Report",
  openGraph: {
    url: "/admin/sales/report",
  },
};

const Page = async () => {
  return <AdminSalesReportPage />;
};

export default Page;
