// app/dashboard/page.tsx

import DashboardPage from "@/components/DashboardPage/DashboardPage";
import prisma from "@/utils/prisma";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { redirect } from "next/navigation";

const Page = async () => {
  const { teamMemberProfile } = await protectionMemberUser();

  if (!teamMemberProfile) return redirect("/auth/login");

  if (teamMemberProfile.company_member_role === "ADMIN") {
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

  return <DashboardPage packages={packages} />;
};

export default Page;
