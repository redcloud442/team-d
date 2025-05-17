export const revalidate = 60; // revalidate this page every 60 seconds

import PackagePage from "@/components/PackagePage/PackagePage";
import { Skeleton } from "@/components/ui/skeleton";
import prisma from "@/utils/prisma";
import { Suspense } from "react";
const page = async () => {
  const packages = await prisma.package_table.findMany({
    where: { package_is_disabled: false },
  });

  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full max-w-3xl" />
          <Skeleton className="h-64 w-full max-w-2xl" />
        </div>
      }
    >
      <PackagePage packages={packages} />
    </Suspense>
  );
};

export default page;
