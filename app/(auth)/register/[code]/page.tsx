import RegisterPage from "@/components/registerPage/registerPage";
import { Skeleton } from "@/components/ui/skeleton";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ code: string }>;
}) {
  const { code } = await searchParams;

  return {
    title: "DIGIWEALTH REGISTRATION",
    description: "DIGIWEALTH REGISTRATION",
    openGraph: {
      url: `https://www.digi-wealth.vip/register/${code}`,
      title: `JOIN DIGIWEALTH!`,
      siteName: "DIGIWEALTH",
      images: [
        {
          url: "https://www.digi-wealth.vip/assets/icons/iconGif.webp",
          width: 1200,
          height: 630,
          alt: "DIGIWEALTH REGISTRATION",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `JOIN DIGIWEALTH!`,
      description: "DIGIWEALTH REGISTRATION",
      images: ["https://www.digi-wealth.vip/assets/icons/iconGif.webp"],
    },
  };
}

const Page = async ({ params }: { params: Promise<{ code: string }> }) => {
  const { code } = await params;

  if (!code) {
    redirect("/login");
  }

  const userData = await fetch(
    `${process.env.API_URL}/api/v1/auth/register/${code}`,
    {
      method: "GET",
    }
  );

  const { data } = await userData.json();

  if (!data) {
    redirect("/login");
  }

  return (
    <Suspense fallback={<Skeleton className="w-full min-h-screen" />}>
      <RegisterPage referralLink={code} userName={data?.user_username || ""} />
    </Suspense>
  );
};

export default Page;
