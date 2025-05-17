// app/dashboard/page.tsx

import DashboardPage from "@/components/DashboardPage/DashboardPage";
import { Skeleton } from "@/components/ui/skeleton";
import prisma from "@/utils/prisma";
import { Suspense } from "react";

const Page = async () => {
  const packages = await prisma.package_table.findMany({
    where: { package_is_disabled: false },
    select: {
      package_id: true,
      package_name: true,
      package_percentage: true,
      packages_days: true,
      package_description: true,
      package_gif: true,
      package_is_disabled: true,
      package_image: true,
    },
  });

  return (
    <Suspense fallback={<Skeleton className="h-full w-full" />}>
      <DashboardPage packages={packages} />
    </Suspense>
  );
};

export default Page;
