import UserProfilePage from "@/components/UserProfilePage/UserProfilePage";
import prisma from "@/utils/prisma";
import { protectionMemberUser } from "@/utils/serversideProtection";
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
  const { profile, redirect: redirectTo } = await protectionMemberUser();

  if (redirectTo) {
    redirect(redirectTo);
  }
  const [userData, allianceData] = await prisma.$transaction([
    prisma.user_table.findFirst({
      where: {
        user_id: profile?.user_id,
      },
    }),
    prisma.alliance_member_table.findFirst({
      where: {
        alliance_member_user_id: profile?.user_id,
      },
    }),
  ]);

  const combinedData = {
    ...userData,
    ...allianceData,
  } as UserRequestdata;

  return <UserProfilePage userProfile={combinedData} />;
};
export default Page;
