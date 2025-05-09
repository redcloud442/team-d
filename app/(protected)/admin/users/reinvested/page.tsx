import AdminUserReinvestedPage from "@/components/AdminUserReinvestedPage/AdminUserReinvestedPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Reinvested",
  description: "List of User Reinvested",
  openGraph: {
    url: "/admin/users/reinvested",
  },
};

const Page = async () => {
  return <AdminUserReinvestedPage />;
};

export default Page;
