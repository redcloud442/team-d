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

  const [packages, testimonials, wheel] = await Promise.all([
    prisma.package_table.findMany({
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
    }),
    prisma.alliance_testimonial_table.findMany({
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
    }),
    prisma.alliance_wheel_settings_table.findMany({
      orderBy: {
        alliance_wheel_settings_date: "desc",
      },
      select: {
        alliance_wheel_settings_id: true,
        alliance_wheel_settings_label: true,
        alliance_wheel_settings_percentage: true,
        alliance_wheel_settings_color: true,
      },
    }),
  ]);

  return (
    <DashboardPage
      packages={packages}
      testimonials={testimonials}
      wheel={wheel}
    />
  );
};

export default Page;
