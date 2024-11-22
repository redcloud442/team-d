import PackagesPage from "@/components/PackagesPage/PackagesPage";
import prisma from "@/utils/prisma";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Packages",
  description: "List of Packages",
  openGraph: {
    url: "/Packages",
  },
};

const Page = async () => {
  const result = await protectionMemberUser();

  if (result.redirect) {
    redirect(result.redirect);
  }

  const packages = await prisma.package_table.findMany();

  return <PackagesPage packages={packages} />;
};

export default Page;
