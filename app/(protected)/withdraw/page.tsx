// app/withdraw/page.tsx
import WithdrawPage from "@/components/WithdrawPage/WithdrawPage";
import { getPhilippinesTime } from "@/utils/function";
import prisma from "@/utils/prisma";
import { createClientServerSide } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

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

  const now = new Date();
  const todayStart = getPhilippinesTime(now, "start");
  const todayEnd = getPhilippinesTime(now, "end");

  const [packageWithdrawal, referralWithdrawal] = await Promise.all([
    prisma.company_withdrawal_request_table.findFirst({
      where: {
        company_withdrawal_request_member_id: companyMemberId,
        company_withdrawal_request_status: { in: ["PENDING", "APPROVED"] },
        company_withdrawal_request_withdraw_type: "PACKAGE",
        company_withdrawal_request_date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    }),
    prisma.company_withdrawal_request_table.findFirst({
      where: {
        company_withdrawal_request_member_id: companyMemberId,
        company_withdrawal_request_status: { in: ["PENDING", "APPROVED"] },
        company_withdrawal_request_withdraw_type: "REFERRAL",
        company_withdrawal_request_date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    }),
  ]);

  if (packageWithdrawal && referralWithdrawal) {
    redirect("/dashboard");
  }

  return <WithdrawPage />;
};

export default Page;
