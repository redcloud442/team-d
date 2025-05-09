import AdminLeaderBoardsPage from "@/components/AdminLeaderBoardsPage/AdminLeaderBoardsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Packages",
  description: "List of Packages",
  openGraph: {
    url: "/admin/leaderboards",
  },
};

const Page = async () => {
  return <AdminLeaderBoardsPage />;
};

export default Page;
