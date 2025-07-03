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

      {/* <DashboardCard
        imageSrc="/assets/icons/deposit.webp"
        imageAlt="Deposit"
        buttons={[
          {
            label: "DEPOSIT",
            href: "/request/deposit",
            disabled: !canUserDeposit,
          },
          { label: "SUBSCRIBE", href: "/subscription" },
          { label: "HISTORY", href: "/history/deposit" },
        ]}
      />

      <DashboardCard
        imageSrc="/assets/icons/withdraw.webp"
        imageAlt="Withdraw"
        buttons={[
          {
            label: "WITHDRAW",
            href: "/request/withdraw",
            disabled: !isWithdrawalToday.referral && !isWithdrawalToday.package,
          },
          { label: "HISTORY", href: "/history/withdrawal" },
        ]}
      />

      <DashboardCard
        imageSrc="/assets/icons/referral.webp"
        imageAlt="Referral"
        buttons={[
          { label: "REFERRAL", href: "/referral" },
          { label: "UNILEVEL", href: "/unilevel" },
          { label: "HISTORY", href: "/history/referral" },
        ]}
      /> */}
    </div>
  );
};

export default DashboardCards;
