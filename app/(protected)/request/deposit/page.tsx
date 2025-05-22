import DepositPage from "@/components/DepositPage/DepositPage";
import { Skeleton } from "@/components/ui/skeleton";
import { createClientServerSide } from "@/utils/supabase/server";
import { merchant_table } from "@/utils/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const getInitialData = async (
  companyMemberId: string,
  cookieHeader: string
) => {
  const [depositRes, merchantRes] = await Promise.all([
    fetch(`${process.env.API_URL}/api/v1/deposit/user/${companyMemberId}`, {
      headers: { cookie: cookieHeader },
    }),
    fetch(`${process.env.API_URL}/api/v1/merchant`, {
      headers: { cookie: cookieHeader },
      next: {
        revalidate: 60,
      },
    }),
  ]);

  if (!merchantRes.ok) {
    throw new Error("Failed to fetch merchant options");
  }

  const [depositData, merchantData] = await Promise.all([
    depositRes.json(),
    merchantRes.json(),
  ]);

  return { depositData, merchantData };
};

const Page = async () => {
  const supabase = await createClientServerSide();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/access/login");

  const companyMemberId = user.user_metadata?.CompanyMemberId;
  const cookieHeader = (await cookies()).toString();

  const { depositData, merchantData } = await getInitialData(
    companyMemberId,
    cookieHeader
  );

  if (depositData) redirect("/digi-dash");

  return (
    <Suspense fallback={<Skeleton className="min-h-screen h-full w-full" />}>
      <DepositPage options={merchantData.data as merchant_table[]} />
    </Suspense>
  );
};

export default Page;
