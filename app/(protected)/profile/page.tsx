import { Skeleton } from "@/components/ui/skeleton";
import UserProfilePageUser from "@/components/UserProfilePage/UserProfilePageUser";
import prisma from "@/utils/prisma";
import { createClientServerSide } from "@/utils/supabase/server";
import { UserRequestdata } from "@/utils/types";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Profile Page",
  description: "User Profile Page",
  openGraph: {
    url: "/profile",
  },
};

const Page = async () => {
  const supabase = await createClientServerSide();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/access/signin");
  }

  const userData = await prisma.user_table.findUnique({
    where: {
      user_id: user.id,
    },
    include: {
      company_member_table: {
        include: {
          dashboard_earnings_summary: true,
        },
      },
    },
  });

  if (!userData) {
    redirect("/500");
  }

  const combinedData = {
    ...userData,
    ...userData.company_member_table[0],
    ...(userData.company_member_table[0]?.dashboard_earnings_summary?.[0] ||
      {}),
  } as unknown as UserRequestdata;

  return (
    <Suspense
      fallback={
        <>
          <Skeleton className="h-[calc(100vh-10rem)] w-full" />
          <Skeleton className="h-[calc(100vh-10rem)] w-full" />
          <Skeleton className="h-[calc(100vh-10rem)] w-full" />
        </>
      }
    >
      <UserProfilePageUser userProfile={combinedData} />
    </Suspense>
  );
};

export default Page;
