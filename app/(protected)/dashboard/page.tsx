// app/dashboard/page.tsx

import DashboardPage from "@/components/DashboardPage/DashboardPage";
import prisma from "@/utils/prisma";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { redirect } from "next/navigation";

const Page = async () => {
  const result = await prisma.$transaction(async (tx) => {
    const authData = await protectionMemberUser(tx);

    if ("redirect" in authData) return { redirectTo: authData.redirect };

    const { profile, teamMemberProfile, referral } = authData;

    if (teamMemberProfile.alliance_member_role === "ADMIN") {
      return { redirectTo: "/admin" };
    }

    const [packages, testimonials, wheel] = await Promise.all([
      tx.package_table.findMany({
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
      tx.alliance_testimonial_table.findMany({
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
      tx.alliance_wheel_settings_table.findMany({
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

    return {
      profile,
      teamMemberProfile,
      referral,
      packages,
      testimonials,
      wheel,
    };
  });

  if ("redirectTo" in result) {
    return redirect(result.redirectTo as string);
  }

  const { referral, packages, testimonials, wheel } = result;

  return (
    <DashboardPage
      referal={referral}
      packages={packages}
      testimonials={testimonials}
      wheel={wheel}
    />
  );
};

export default Page;
