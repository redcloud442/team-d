import DashboardDepositModalDeposit from "../DashboardDepositRequest/DashboardDepositModal/DashboardDepositModalDeposit";
import DashboardDepositModalPackages from "../DashboardDepositRequest/DashboardDepositModal/DashboardDepositPackagesModal";
import DashboardWithdrawModalWithdraw from "../DashboardWithdrawRequest/DashboardWithdrawModal/DashboardWithdrawModalWithdraw";
import DashboardHistory from "./DashboardHistory";

const DashboardCards = () => {
  return (
    <div className="flex flex-col gap-3">
      <DashboardDepositModalDeposit />

      <DashboardDepositModalPackages />

      <DashboardWithdrawModalWithdraw />

      <DashboardHistory />
    </div>
  );
};

export default DashboardCards;
