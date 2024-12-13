import RegisterPage from "@/components/registerPage/registerPage";
import prisma from "@/utils/prisma";
import { protectionRegisteredUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";
export const metadata: Metadata = {
  title: "Register an account",
  description: "Register an account",
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
  });

  return (
    <main className="max-w-full min-h-screen flex flex-col items-center justify-center">
      <RegisterPage referralLink={referralLink} />
    </main>
  );
};

export default Page;
