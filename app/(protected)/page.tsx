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
  const { redirect: redirectTo, earnings } = await protectionMemberUser();

  if (redirectTo) {
    redirect(redirectTo);
  }

  if (!earnings) return redirect("/500");

  return <DashboardPage earnings={earnings} />;
};

export default Page;
