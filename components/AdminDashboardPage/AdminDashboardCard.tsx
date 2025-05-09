import { formatNumberLocale } from "@/utils/function";
import { AdminDashboardDataByDate } from "@/utils/types";
import {
  CoinsIcon,
  CreditCard,
  Package,
  PhilippinePeso,
  UserCheck2Icon,
} from "lucide-react";
import CardAmountAdmin from "../ui/CardAmountAdmin";

type Props = {
  adminDashboardDataByDate: AdminDashboardDataByDate;
};

const AdminDashboardCard = ({ adminDashboardDataByDate }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <CardAmountAdmin
        title="Total Package"
        value={
          <>
            <PhilippinePeso />{" "}
            {formatNumberLocale(adminDashboardDataByDate?.packageEarnings ?? 0)}
          </>
        }
        description=""
        descriptionClassName="text-sm text-green-600"
      />
      <CardAmountAdmin
        title="Total Earnings"
        value={
          <>
            <PhilippinePeso />{" "}
            {formatNumberLocale(adminDashboardDataByDate?.totalEarnings ?? 0)}
          </>
        }
        description=""
        descriptionClassName="text-sm text-green-600"
      />
      <CardAmountAdmin
        title="Total Withdraw"
        value={
          <>
            <PhilippinePeso />{" "}
            {formatNumberLocale(adminDashboardDataByDate?.totalWithdraw ?? 0)}
          </>
        }
        description=""
        descriptionClassName="text-sm text-gray-500"
      />
      <CardAmountAdmin
        title="Direct Referral"
        value={
          <>
            <PhilippinePeso />{" "}
            {formatNumberLocale(adminDashboardDataByDate?.directLoot ?? 0)}
          </>
        }
        description=""
        descriptionClassName="text-sm text-gray-500"
      />
      <CardAmountAdmin
        title="Indirect Referral"
        value={
          <>
            <PhilippinePeso />{" "}
            {formatNumberLocale(adminDashboardDataByDate?.indirectLoot ?? 0)}
          </>
        }
        description=""
        descriptionClassName="text-sm text-gray-500"
      />
      <CardAmountAdmin
        title="Active Package"
        value={
          <>
            <Package />
            {adminDashboardDataByDate?.activePackageWithinTheDay ?? 0}
          </>
        }
        description=""
        descriptionClassName="text-sm text-gray-500"
      />
      <CardAmountAdmin
        title="Active Users"
        value={
          <>
            <UserCheck2Icon />
            {adminDashboardDataByDate?.totalActivatedUserByDate ?? 0}
          </>
        }
        description=""
        descriptionClassName="text-sm text-gray-500"
      />{" "}
      <CardAmountAdmin
        title="Approved Withdrawal"
        value={
          <>
            <CreditCard />
            {formatNumberLocale(
              adminDashboardDataByDate?.totalApprovedWithdrawal ?? 0
            )}
          </>
        }
        description=""
        descriptionClassName="text-sm text-gray-500"
      />
      <CardAmountAdmin
        title="Approved Receipts"
        value={
          <>
            <CreditCard />
            {formatNumberLocale(
              adminDashboardDataByDate?.totalApprovedReceipts ?? 0
            )}
          </>
        }
        description=""
        descriptionClassName="text-sm text-gray-500"
      />
      <CardAmountAdmin
        title="Sales Difference"
        value={
          <>
            <CreditCard />
            {formatNumberLocale(
              Number(adminDashboardDataByDate?.totalEarnings ?? 0) -
                Number(adminDashboardDataByDate?.totalWithdraw ?? 0)
            )}
          </>
        }
        description=""
        descriptionClassName="text-sm text-gray-500"
      />
      <CardAmountAdmin
        title="User Reinvested"
        value={
          <>
            <CoinsIcon />
            {adminDashboardDataByDate?.reinvestorsCount ?? 0}
          </>
        }
        description=""
        descriptionClassName="text-sm text-gray-500"
      />
      <CardAmountAdmin
        title="Amount Reinvested"
        value={
          <>
            <PhilippinePeso />
            {formatNumberLocale(
              adminDashboardDataByDate?.totalReinvestmentAmount ?? 0
            )}
          </>
        }
        description=""
        descriptionClassName="text-sm text-gray-500"
      />
    </div>
  );
};

export default AdminDashboardCard;
