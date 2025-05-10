import DashboardDepositModalDeposit from "../DashboardPage/DashboardDepositRequest/DashboardDepositModal/DashboardDepositModalDeposit";
import ReusableCard from "../ui/card-reusable";

const DepositPage = () => {
  return (
    <ReusableCard
      type="user"
      title="Deposit Request"
      className="flex items-start justify-center h-full"
    >
      <DashboardDepositModalDeposit />
    </ReusableCard>
  );
};

export default DepositPage;
