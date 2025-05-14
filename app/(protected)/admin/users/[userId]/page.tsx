import UserAdminProfile from "@/components/UserAdminProfile/UserAdminProfile";
import prisma from "@/utils/prisma";
import { protectionAdminUser } from "@/utils/serversideProtection";
import { UserRequestdata } from "@/utils/types";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "User Profile Records",
  description: "List of User Records",
  openGraph: {
    url: "/admin/users",
  },
};

const Page = async ({ params }: { params: Promise<{ userId: string }> }) => {
  const { userId } = await params;

  const { teamMemberProfile, profile } = await protectionAdminUser();

  if (!teamMemberProfile) return redirect("/auth/login");

  const userData = await prisma.user_table.findUnique({
    where: { user_id: userId },
    include: {
      company_member_table: {
        include: {
          dashboard_earnings_summary: true,
          merchant_member_table: true,
        },
      },
    },
  });

  if (!userData) return redirect("/500");

  const earningsData =
    userData.company_member_table[0]?.dashboard_earnings_summary[0];
  const allianceData = userData.company_member_table[0];
  const merchantData =
    userData.company_member_table[0]?.merchant_member_table[0];

  const combinedData = {
    ...userData,
    ...allianceData,
    ...merchantData,
    ...earningsData,
  } as UserRequestdata;

  if (!combinedData) return redirect("/auth/login");

  return <UserAdminProfile profile={profile} userProfile={combinedData} />;
};

export default Page;
