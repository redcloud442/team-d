import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartDataMember } from "@/utils/types";
import {
  alliance_earnings_table,
  alliance_member_table,
  package_table,
} from "@prisma/client";
import { Dispatch, SetStateAction } from "react";
import DashboardDepositModalHistory from "./DashboardDepositModal/DashboardDepositHistory";
import DashboardDepositModalDeposit from "./DashboardDepositModal/DashboardDepositModalDeposit";
import DashboardDepositModalPackages from "./DashboardDepositModal/DashboardDepositPackagesModal";

type Props = {
  teamMemberProfile: alliance_member_table;
  packages: package_table[];
  earnings: alliance_earnings_table;
  setEarnings: Dispatch<SetStateAction<alliance_earnings_table>>;
  setChartData: Dispatch<SetStateAction<ChartDataMember[]>>;
  setIsActive: Dispatch<SetStateAction<boolean>>;
};

const DashboardDepositRequest = ({
  packages,
  setChartData,
  teamMemberProfile,
  earnings,
  setEarnings,
  setIsActive,
}: Props) => {
  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>Deposit Request</CardTitle>
        <CardDescription>Inveest in your future with us </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between gap-4">
          <h1 className="text-xl font-bold">Deposit Now</h1>
          <div className="flex flex-col w-full max-w-lg gap-2">
            <DashboardDepositModalDeposit
              teamMemberProfile={teamMemberProfile}
            />

            <DashboardDepositModalPackages
              packages={packages}
              earnings={earnings}
              teamMemberProfile={teamMemberProfile}
              setEarnings={setEarnings}
              setChartData={setChartData}
              setIsActive={setIsActive}
            />

            <DashboardDepositModalHistory
              teamMemberProfile={teamMemberProfile}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardDepositRequest;
