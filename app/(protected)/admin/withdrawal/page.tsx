import AdminWithdrawalHistoryPage from "@/components/AdminWithdrawalListPage/AdminWithdrawalPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Withdrawal Records",
  description: "List of Withdrawal Records",
  openGraph: {
    url: "/admin/withdrawal",
  },
};

const Page = async () => {
  return <AdminWithdrawalHistoryPage />;
};

export default Page;
