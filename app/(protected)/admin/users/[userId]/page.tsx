import { Skeleton } from "@/components/ui/skeleton";
import UserAdminProfile from "@/components/UserAdminProfile/UserAdminProfile";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "User Profile Records",
  description: "List of User Records",
  openGraph: {
    url: "/admin/users",
  },
};

const Page = async ({ params }: { params: Promise<{ userId: string }> }) => {
  const { userId } = await params;

  const userData = await fetch(`${process.env.API_URL}/api/v1/user/${userId}`, {
    method: "GET",
    headers: {
      cookie: (await cookies()).toString(),
    },
  });

  const combinedData = await userData.json();

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
      <UserAdminProfile userProfile={combinedData} />
    </Suspense>
  );
};

export default Page;
