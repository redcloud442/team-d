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

const handleFetchUserProfile = async (userId: string) => {
  const userProfile = await fetch(
    `${process.env.API_URL}/api/v1/user/${userId}/user-profile`,
    {
      method: "GET",
      headers: {
        cookie: (await cookies()).toString(),
      },
    }
  );

  if (!userProfile.ok) {
    throw new Error("Failed to fetch user profile");
  }

  return userProfile.json();
};

const Page = async ({ params }: { params: Promise<{ userId: string }> }) => {
  const { userId } = await params;

  const { userProfile, teamMemberProfile, merchantData } =
    await handleFetchUserProfile(userId);

  const combinedData = {
    ...userProfile,
    ...teamMemberProfile,
    ...merchantData,
  };

  return (
    <Suspense
      fallback={
        <div className="min-h-screen h-full">
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
