import RegisterPage from "@/components/registerPage/registerPage";
import prisma from "@/utils/prisma";
import { redirect } from "next/navigation";

// export async function generateMetadata({
//   searchParams,
// }: {
//   searchParams: Promise<{ CODE: string }>;
// }) {
//   const { CODE } = await searchParams;

//   return {
//     title: "Starter Next Register | Join Now",
//     description: "Starter Next ang sagot !",
//     openGraph: {
//       url: `https://starternext.com/auth/register?CODE=${CODE}`,
//       title: `Join Starter Next Now! Referred by ${CODE}`,
//       description: "Starter Next ang sagot !",
//       siteName: "starternext.com",
//       images: [
//         {
//           url: "https://starternext.com/app-logo.png",
//           width: 1200,
//           height: 630,
//           alt: "Starter Next Registration Page",
//         },
//       ],
//       type: "website",
//     },
//   };
// }

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
        },
      },
    },
    select: {
      user_username: true,
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="max-w-full min-h-screen flex flex-col items-center justify-center p-4">
      <RegisterPage referralLink={CODE} userName={user?.user_username || ""} />
    </div>
  );
};

export default Page;
