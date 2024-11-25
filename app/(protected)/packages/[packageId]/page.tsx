import AvailPackagePage from "@/components/AvailPackagePage/AvailPackagePage";
import prisma from "@/utils/prisma";
import { protectionMemberUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Package",
  description: "Specific Page Page",
  openGraph: {
    url: "/packages/[packageId]",
  },
};

const Page = async ({ params }: { params: Promise<{ packageId: string }> }) => {
  const { packageId } = await params;

  const {
    redirect: redirectTo,
    earnings,
    teamMemberProfile,
  } = await protectionMemberUser();

  if (redirectTo) {
    redirect(redirectTo);
  }

  if (!earnings) return redirect("/500");

  const pkg = await prisma.package_table.findUnique({
    where: {
      package_id: packageId,
    },
  });

  if (!pkg) {
    redirect("/");
  }

  return (
    <AvailPackagePage
      teamMemberProfile={teamMemberProfile}
      pkg={pkg}
      earnings={earnings}
    />
  );
};

export default Page;
