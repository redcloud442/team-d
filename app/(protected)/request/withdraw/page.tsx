// app/withdraw/page.tsx
import { Skeleton } from "@/components/ui/skeleton";
import WithdrawPage from "@/components/WithdrawPage/WithdrawPage";
import { createClientServerSide } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const Page = async () => {
  const supabase = await createClientServerSide();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/access/login");
  }

  const companyMemberId = user.user_metadata?.CompanyMemberId;
  if (!companyMemberId) {
    redirect("/access/login"); // Fallback if ID missing
  }

  const existingWithdrawalData = await fetch(
    `${process.env.API_URL}/api/v1/withdraw/user/${companyMemberId}`,
    {
      method: "GET",
      headers: {
        cookie: (await cookies()).toString(),
      },
    }
  );

  const { packageWithdrawal, referralWithdrawal } =
    await existingWithdrawalData.json();

  if (packageWithdrawal && referralWithdrawal) {
    redirect("/digi-dash");
  }

  return (
    <Suspense fallback={<Skeleton className="h-screen w-full" />}>
      <WithdrawPage />
    </Suspense>
  );
};

export default Page;
