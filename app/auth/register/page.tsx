import RegisterPage from "@/components/registerPage/registerPage";
import prisma from "@/utils/prisma";
import { protectionRegisteredUser } from "@/utils/serversideProtection";
import { redirect } from "next/navigation";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ referralLink: string }>;
}) {
  const { referralLink } = await searchParams;

  return {
    title: "Starter Next Register | Join Now",
    description: "Starter Next ang sagot !",
    openGraph: {
      url: `https://starternext.com/auth/register?referralLink=${referralLink}`,
      title: `Join Starter Next Now! Referred by ${referralLink}`,
      description: "Starter Next ang sagot !",
      siteName: "starternext.com",
      images: [
        {
          url: "https://starternext.com/app-logo.png",
          width: 1200,
          height: 630,
          alt: "Starter Next Registration Page",
        },
      ],
      type: "website",
    },
  };
}

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
