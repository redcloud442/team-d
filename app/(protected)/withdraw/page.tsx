import WithdrawPage from "@/components/WithdrawPage/WithdrawPage";
import { getPhilippinesTime } from "@/utils/function";
import prisma from "@/utils/prisma";
import { createClientServerSide } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const page = async () => {
  const supabase = await createClientServerSide();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/access/login");
  }

  const todayStart = getPhilippinesTime(new Date(new Date()), "start");
  const todayEnd = getPhilippinesTime(new Date(new Date()), "end");

  const existingPackageWithdrawal =
    !!(await prisma.company_withdrawal_request_table.findFirst({
      where: {
        company_withdrawal_request_member_id:
          user.user_metadata.CompanyMemberId,
        company_withdrawal_request_status: {
          in: ["PENDING", "APPROVED"],
        },

        company_withdrawal_request_withdraw_type: "PACKAGE",
        company_withdrawal_request_date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    }));

  const existingReferralWithdrawal =
    !!(await prisma.company_withdrawal_request_table.findFirst({
      where: {
        company_withdrawal_request_member_id:
          user.user_metadata.CompanyMemberId,
        company_withdrawal_request_status: {
          in: ["PENDING", "APPROVED"],
        },
        company_withdrawal_request_withdraw_type: "REFERRAL",
        company_withdrawal_request_date: {
          gte: getPhilippinesTime(new Date(new Date()), "start"),
          lte: getPhilippinesTime(new Date(new Date()), "end"),
        },
      },
    }));

  if (existingPackageWithdrawal && existingReferralWithdrawal) {
    redirect("/dashboard");
  }

  return <WithdrawPage />;
};

export default page;
