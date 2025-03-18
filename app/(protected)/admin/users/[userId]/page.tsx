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

  const { teamMemberProfile, profile } = await protectionAdminUser().catch(
    () => ({ teamMemberProfile: null, profile: null })
  );

  if (!teamMemberProfile) return redirect("/auth/login");

  const [userData, allianceData, earningsData] = await prisma.$transaction(
    async (tx) => {
      const user = await tx.user_table.findUnique({
        where: { user_id: userId },
      });

      if (!user) return [null, null, null]; // Stop further queries if user doesn't exist

      const alliance = await tx.alliance_member_table.findFirst({
        where: { alliance_member_user_id: userId },
      });

      const earnings = alliance
        ? await tx.dashboard_earnings_summary.findUnique({
            where: { member_id: alliance.alliance_member_id },
          })
        : null;

      return [user, alliance, earnings];
    }
  );

  const merchantData = allianceData
    ? await prisma.merchant_member_table.findFirst({
        where: {
          merchant_member_merchant_id: allianceData.alliance_member_id,
        },
      })
    : null;

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
