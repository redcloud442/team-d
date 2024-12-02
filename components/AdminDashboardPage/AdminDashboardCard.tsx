import CardAmountAdmin from "../ui/CardAmountAdmin";
type Props = {
  totalEarnings: number;
  totalWithdraw: number;
  totalLoot: number;
};
const AdminDashboardCard = ({
  totalEarnings,
  totalWithdraw,
  totalLoot,
}: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
      <CardAmountAdmin
        title="Total Earnings"
        value={totalEarnings}
        description=""
        descriptionClassName="text-sm text-green-600"
      />

      <CardAmountAdmin
        title="Total Withdraw"
        value={totalWithdraw}
        description=""
        descriptionClassName="text-sm text-gray-500"
      />
      <CardAmountAdmin
        title="Total Loot"
        value={totalLoot}
        description=""
        descriptionClassName="text-sm text-gray-500"
      />
    </div>
  );
};

export default AdminDashboardCard;
