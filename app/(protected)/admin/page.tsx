import AdminDashboardPage from "@/components/AdminDashboardPage/AdminDashboardPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "List of Withdrawal Records",
  openGraph: {
    url: "/admin",
  },
};

const Page = async () => {
  return <AdminDashboardPage />;
};

export default Page;
