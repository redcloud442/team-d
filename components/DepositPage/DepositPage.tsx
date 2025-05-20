import { merchant_table } from "@/utils/types";
import DashboardDepositModalDeposit from "../DashboardPage/DashboardDepositRequest/DashboardDepositModal/DashboardDepositModalDeposit";

const DepositPage = ({ options }: { options: merchant_table[] }) => {
  return (
    <>
      <div className="space-x-1">
        <span className="text-2xl font-bold">MAKE A</span>
        <span className="text-2xl font-bold text-bg-primary-blue">DEPOSIT</span>
      </div>
      <DashboardDepositModalDeposit options={options} />
    </>
  );
};

export default DepositPage;
