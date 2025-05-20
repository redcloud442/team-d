import DashboardWithdrawModalWithdraw from "../DashboardPage/DashboardWithdrawRequest/DashboardWithdrawModal/DashboardWithdrawModalWithdraw";

const WithdrawPage = () => {
  return (
    <>
      <div className="space-x-1">
        <span className="text-2xl font-bold text-bg-primary-blue">
          WITHDRAW
        </span>
        <span className="text-2xl font-bold ">REQUEST</span>
      </div>
      <DashboardWithdrawModalWithdraw />
    </>
  );
};

export default WithdrawPage;
