import MerchantPage from "@/components/MerchantPage/MerchantPage";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";
export const metadata: Metadata = {
  title: "Merchant Page",
  description: "Merchant Page",
  openGraph: {
    url: "/merchant",
  },
};

const Page = async () => {
  const { teamMemberProfile, redirect: redirectTo } =
    await protectionMemberUser();

  if (redirectTo) {
    redirect(redirectTo);
  }

  if (!teamMemberProfile) {
    redirect("/500");
  }
  return <MerchantPage teamMemberProfile={teamMemberProfile} />;
};
export default Page;
