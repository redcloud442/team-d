import RegisterPage from "@/components/registerPage/registerPage";
import prisma from "@/utils/prisma";
import { protectionRegisteredUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Pr1me Register | Join Now",
  description: "Pr1me ang sagot !",
  openGraph: {
    url: "/auth/register",
    title: "Pr1me Register | Join Now",
    description: "Pr1me ang sagot !",
    siteName: "primepinas.com",
    images: [
      {
        url: "/app-logo.png",
        width: 1200,
        height: 630,
        alt: "Pr1me Registration Page",
      },
    ],
    type: "website",
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

  // const teamMemberProfile = await prisma.alliance_member_table.findFirst({
  //   where: {
  //     alliance_member_user_id: user?.user_id,
  //   },
  //   select: {
  //     alliance_member_is_active: true,
  //   },
  // });

  // if (!teamMemberProfile?.alliance_member_is_active) {
  //   redirect("/auth/login");
  // }

  return (
    <main className="max-w-full min-h-screen flex flex-col items-center justify-center p-4 bg-pageColor">
      <RegisterPage referralLink={referralLink} />
    </main>
  );
};

export default Page;
