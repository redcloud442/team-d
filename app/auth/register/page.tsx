import RegisterPage from "@/components/registerPage/registerPage";
import prisma from "@/utils/prisma";
import { protectionRegisteredUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Pr1me Register",
  description: "Register to your Pr1me account",
  openGraph: {
    url: "/auth/register",
  },
};

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ referralLink: string }>;
}) => {
  const { referralLink } = await searchParams;
  const result = await protectionRegisteredUser();

  if (result?.redirect || !referralLink) {
    redirect("/");
  }

  const user = await prisma.user_table.findFirst({
    where: {
      user_username: referralLink,
    },
    select: {
      user_username: true,
      user_id: true,
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  const teamMemberProfile = await prisma.alliance_member_table.findFirst({
    where: {
      alliance_member_user_id: user?.user_id,
    },
    select: {
      alliance_member_is_active: true,
    },
  });

  if (!teamMemberProfile?.alliance_member_is_active) {
    redirect("/auth/login");
  }

  return (
    <main className="max-w-full min-h-screen flex flex-col items-center justify-center p-4 bg-pageColor">
      <RegisterPage referralLink={referralLink} />
    </main>
  );
};

export default Page;
