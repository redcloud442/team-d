import DashboardPage from "@/components/DashboardPage/DashboardPage";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "List of records",
  openGraph: {
    url: "/",
  },
};

const Page = async () => {
  const {
    redirect: redirectTo,
    earnings,
    referal,
  } = await protectionMemberUser();

  if (redirectTo) {
    redirect(redirectTo);
  }

  if (!earnings || !referal) return redirect("/500");

  return <DashboardPage referal={referal} earnings={earnings} />;
};

export default Page;
