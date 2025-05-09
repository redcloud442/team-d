import AdminTopUpApprovalPage from "@/components/AdminTopUpApprovalPage/AdminTopUpApprovalPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deposit Records",
  description: "List of Deposit Records",
  openGraph: {
    url: "/admin/deposit",
  },
};

const Page = async () => {
  return <AdminTopUpApprovalPage />;
};

export default Page;
