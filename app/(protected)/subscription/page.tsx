export const revalidate = 60;

import PackagePage from "@/components/PackagePage/PackagePage";
import { Skeleton } from "@/components/ui/skeleton";
import { package_table } from "@/utils/types";
import { cookies } from "next/headers";
import { Suspense } from "react";

const page = async () => {
  const packages = await fetch("http://localhost:8000/api/v1/package", {
    method: "GET",
    headers: {
      cookie: (await cookies()).toString(),
    },
    credentials: "include",
  });

  const { data } = (await packages.json()) || [];

  return (
    <Suspense fallback={<Skeleton className="h-full w-full" />}>
      <PackagePage
        packages={
          data as (package_table & {
            package_features_table: {
              package_features_description: { text: string; value: string }[];
            }[];
          })[]
        }
      />
    </Suspense>
  );
};

export default page;
