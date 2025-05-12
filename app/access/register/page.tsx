import RegisterPage from "@/components/registerPage/registerPage";
import prisma from "@/utils/prisma";
import { redirect } from "next/navigation";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ CODE: string }>;
}) {
  const { CODE } = await searchParams;

  return {
    title: "Xelora | Register and Begin Your Journey",
    description:
      "Join Xelora now — your path to digital prosperity begins here!",
    openGraph: {
      url: `https://xelora.io/access/register?CODE=${CODE}`,
      title: `Join Xelora Now! Invited by ${CODE}`,
      description:
        "Unlock exclusive rewards and opportunities by joining Xelora today.",
      siteName: "xelora.io",
      images: [
        {
          url: "https://xelora.io/assets/icons/logo.ico",
          width: 1200,
          height: 630,
          alt: "Xelora Registration Banner",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Join Xeloria Now! Invited by ${CODE}`,
      description: "Be part of the Xeloria revolution — register today.",
      images: ["https://xelora.io/assets/icons/logo.ico"], // Same or different from OG
    },
  };
}

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ CODE: string }>;
}) => {
  const { CODE } = await searchParams;

  if (!CODE) {
    redirect("/auth/login");
  }

  const user = await prisma.user_table.findFirst({
    where: {
      company_member_table: {
        some: {
          company_referral_link_table: {
            some: {
              company_referral_code: CODE,
            },
          },
          AND: [
            {
              company_member_is_active: true,
            },
          ],
        },
      },
    },
    select: {
      user_username: true,
    },
  });

  if (!user) {
    redirect("/access/login");
  }

  return (
    <RegisterPage referralLink={CODE} userName={user?.user_username || ""} />
  );
};

export default Page;
