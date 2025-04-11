// app/dashboard/page.tsx

import DashboardPage from "@/components/DashboardPage/DashboardPage";
import prisma from "@/utils/prisma";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { redirect } from "next/navigation";

const Page = async () => {
  const { teamMemberProfile } = await protectionMemberUser();

  if (!teamMemberProfile) return redirect("/auth/login");

  if (teamMemberProfile.alliance_member_role === "ADMIN") {
    redirect("/admin");
  }

  const packages = await prisma.package_table.findMany({
    where: { package_is_disabled: false },
    select: {
      package_id: true,
      package_name: true,
      package_percentage: true,
      packages_days: true,
      package_description: true,
      package_color: true,
      package_is_disabled: true,
      package_image: true,
    },
  });

  const testimonials = await prisma.alliance_testimonial_table.findMany({
    where: { alliance_testimonial_is_hidden: false },
    select: {
      alliance_testimonial_id: true,
      alliance_testimonial_date_created: true,
      alliance_testimonial_url: true,
      alliance_testimonial_thumbnail: true,
      alliance_testimonial_is_hidden: true,
    },
    orderBy: {
      alliance_testimonial_date_created: "desc",
    },
  });

  const wheel = await prisma.alliance_wheel_settings_table.findMany({
    orderBy: {
      alliance_wheel_settings_date: "desc",
    },
    select: {
      alliance_wheel_settings_id: true,
      alliance_wheel_settings_label: true,
      alliance_wheel_settings_percentage: true,
      alliance_wheel_settings_color: true,
    },
  });

  const reinvestment = await prisma.package_table.findMany({
    select: {
      package_id: true,
      package_percentage: true,
      package_is_disabled: true,
      package_name: true,
      package_description: true,
      packages_days: true,
      package_color: true,
      package_image: true,
    },
  });

  const raffle = await prisma.alliance_promo_banner_table.findMany({
    where: {
      alliance_promo_banner_is_disabled: false,
    },
    orderBy: {
      alliance_promo_banner_date: "desc",
    },
  });

  return (
    <DashboardPage
      packages={packages}
      testimonials={testimonials}
      wheel={wheel}
      reinvestment={reinvestment}
      raffle={raffle}
    />
  );
};

export default Page;
