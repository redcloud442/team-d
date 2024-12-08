import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  alliance_earnings_table,
  alliance_member_table,
  package_table,
} from "@prisma/client";
import DashboardDepositModalHistory from "./DashboardDepositModal/DashboardDepositHistory";
import DashboardDepositModalDeposit from "./DashboardDepositModal/DashboardDepositModalDeposit";
import DashboardDepositModalPackages from "./DashboardDepositModal/DashboardDepositPackagesModal";

type Props = {
  teamMemberProfile: alliance_member_table;
  packages: package_table[];
  earnings: alliance_earnings_table;
};

const DashboardDepositRequest = ({
  packages,
  teamMemberProfile,
  earnings,
}: Props) => {
  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>Deposit Request</CardTitle>
        <CardDescription>Completion status for packages</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between gap-4">
          <h1 className="text-xl font-bold">Deposit World</h1>
          <div className="flex flex-col w-full max-w-lg gap-2">
            <DashboardDepositModalDeposit
              teamMemberProfile={teamMemberProfile}
            />

            <DashboardDepositModalPackages
              packages={packages}
              earnings={earnings}
              teamMemberProfile={teamMemberProfile}
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
