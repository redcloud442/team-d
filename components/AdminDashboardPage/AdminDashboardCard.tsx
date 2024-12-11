import CardAmountAdmin from "../ui/CardAmountAdmin";

type Props = {
  totalEarnings: number;
  totalWithdraw: number;
  directLoot: number;
  indirectLoot: number;
  activePackageWithinTheDay: number;
  numberOfRegisteredUser: number;
};

const AdminDashboardCard = ({
  totalEarnings,
  totalWithdraw,
  directLoot,
  indirectLoot,
  activePackageWithinTheDay,
  numberOfRegisteredUser,
}: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <CardAmountAdmin
        title="Total Earnings"
        value={Number(totalEarnings).toLocaleString() as unknown as number}
        description=""
        descriptionClassName="text-sm text-green-600"
      />

      <CardAmountAdmin
        title="Total Withdraw"
        value={Number(totalWithdraw).toLocaleString() as unknown as number}
        description=""
        descriptionClassName="text-sm text-gray-500"
      />

      <CardAmountAdmin
        title="Direct Referral"
        value={Number(directLoot).toLocaleString() as unknown as number}
        description=""
        descriptionClassName="text-sm text-gray-500"
      />

      <CardAmountAdmin
        title="Indirect Referral"
        value={Number(indirectLoot).toLocaleString() as unknown as number}
        description=""
        descriptionClassName="text-sm text-gray-500"
      />

      <CardAmountAdmin
        title="Indirect Referral"
        value={Number(indirectLoot).toLocaleString() as unknown as number}
        description=""
        descriptionClassName="text-sm text-gray-500"
      />

      <CardAmountAdmin
        title="Active Package"
        value={activePackageWithinTheDay as unknown as number}
        description=""
        descriptionClassName="text-sm text-gray-500"
      />

      <CardAmountAdmin
        title="Total Registered User"
        value={numberOfRegisteredUser}
        description=""
        descriptionClassName="text-sm text-gray-500"
      />
    </div>
  );
};

export default AdminDashboardCard;
