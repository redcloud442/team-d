import DepositPage from "@/components/DepositPage/DepositPage";
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

  const existingDeposit =
    !!(await prisma.company_deposit_request_table.findFirst({
      where: {
        company_deposit_request_member_id: user.user_metadata.CompanyMemberId,
        company_deposit_request_status: "PENDING",
      },
      take: 1,
      orderBy: {
        company_deposit_request_date: "desc",
      },
    }));

  if (existingDeposit) {
    redirect("/dashboard");
  }

  return <DepositPage />;
};

export default page;
