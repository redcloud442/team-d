import AdminUserPage from "@/components/AdminUsersPage/AdminUsersPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Records",
  description: "List of User Records",
  openGraph: {
    url: "/admin/users",
  },
};

const Page = async () => {
  return <AdminUserPage />;
};

export default Page;
