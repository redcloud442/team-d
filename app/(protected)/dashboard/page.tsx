import DashboardPage from "@/components/DashboardPage/DashboardPage";
import prisma from "@/utils/prisma";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Pr1me Dashboard",
  openGraph: {
    url: "/dashboard",
  },
};

const Page = async () => {
  const {
    redirect: redirectTo,
    referal,
    teamMemberProfile,
    profile,
  } = await protectionMemberUser();

  if (redirectTo) {
    redirect(redirectTo);
  }

  if (!teamMemberProfile) return redirect("/500");

  const packages = await prisma.package_table.findMany({
    where: {
      package_is_disabled: false,
    },
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

  if (teamMemberProfile.alliance_member_role === "ADMIN") {
    return redirect("/admin");
  }

  const testimonials = await prisma.alliance_testimonial_table.findMany({
    where: {
      alliance_testimonial_is_hidden: false,
    },
    select: {
      alliance_testimonial_url: true,
      alliance_testimonial_thumbnail: true,
    },
    orderBy: {
      alliance_testimonial_date_created: "desc",
    },
  });

  return (
    <DashboardPage
      profile={profile}
      teamMemberProfile={teamMemberProfile}
      referal={referal}
      packages={packages}
      testimonials={
        testimonials as {
          alliance_testimonial_id: string;
          alliance_testimonial_date_created: Date;
          alliance_testimonial_url: string;
          alliance_testimonial_thumbnail: string | null;
          alliance_testimonial_is_hidden: boolean;
        }[]
      }
    />
  );
};

export default Page;
