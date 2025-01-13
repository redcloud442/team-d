import DashboardPage from "@/components/DashboardPage/DashboardPage";
import prisma from "@/utils/prisma";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { createClientServerSide } from "@/utils/supabase/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Pr1me Dashboard",
  openGraph: {
    url: "/",
  },
};

const Page = async () => {
  const supabaseClient = await createClientServerSide();
  const {
    redirect: redirectTo,
    earnings,
    referal,
    teamMemberProfile,
    profile,
  } = await protectionMemberUser();

  if (redirectTo) {
    redirect(redirectTo);
  }

  if (!earnings || !teamMemberProfile) return redirect("/500");

  const packages = await prisma.package_table.findMany({
    where: {
      package_is_disabled: false,
    },
    select: {
      package_id: true,
      package_name: true,
      package_percentage: true,
      packages_days: true,
      package_description: true,
      package_color: true,
      package_is_disabled: true,
    },
  });

  const { data: userData } = await supabaseClient.rpc("get_user_sponsor", {
    input_data: { userId: profile.user_id },
  });

  if (teamMemberProfile.alliance_member_role === "ADMIN")
    return redirect("/admin");

  return (
    <DashboardPage
      profile={profile}
      teamMemberProfile={teamMemberProfile}
      referal={referal}
      earnings={earnings}
      packages={packages}
      sponsor={userData?.user_username || ""}
    />
  );
};

export default Page;
