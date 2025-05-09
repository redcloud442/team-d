import AdminWithdrawalReport from "@/components/AdminWithdrawalReport/AdminWithdrawalReport";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Withdrawal Report",
  description: "Withdrawal Report",
  openGraph: {
    url: "/admin/withdrawal/report",
  },
};

const Page = async () => {
  return <AdminWithdrawalReport />;
};

export default Page;
