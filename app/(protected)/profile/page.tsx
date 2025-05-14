import UserProfilePageUser from "@/components/UserProfilePage/UserProfilePageUser";
import prisma from "@/utils/prisma";
import { createClientServerSide } from "@/utils/supabase/server";
import { UserRequestdata } from "@/utils/types";
import { Metadata } from "next";
import { redirect } from "next/navigation";

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

  return <UserProfilePageUser userProfile={combinedData} />;
};

export default Page;
