import AdminBannerPage from "@/components/AdminBannerPage/AdminBannerPage";
import prisma from "@/utils/prisma";
import { protectionAdminUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Banner",
  description: "Banner",
  openGraph: {
    url: "/admin/banner",
  },
};

const Page = async () => {
  const { teamMemberProfile } = await protectionAdminUser();

  if (!teamMemberProfile) return redirect("/auth/login");

  const banner = await prisma.alliance_promo_banner_table.findMany({
    where: {
      alliance_promo_banner_is_disabled: false,
    },
    orderBy: {
      alliance_promo_banner_date: "desc",
    },
  });

  return <AdminBannerPage banner={banner} />;
};

export default Page;
