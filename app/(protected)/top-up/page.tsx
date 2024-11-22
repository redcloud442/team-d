import TopUpPage from "@/components/TopUpPage/TopUpPage";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Top Up",
  description: "Top Up Page",
  openGraph: {
    url: "/top-up",
  },
};

const Page = async () => {
  const result = await protectionMemberUser();

  if (result.redirect) {
    redirect(result.redirect);
  }
  return <TopUpPage />;
};

export default Page;
