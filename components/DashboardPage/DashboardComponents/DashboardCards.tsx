import DashboardCard from "@/components/DashboardCard/DashboardCard";
import { useUserHaveAlreadyWithdraw } from "@/store/useWithdrawalToday";

const DashboardCards = () => {
  const { isWithdrawalToday, canUserDeposit } = useUserHaveAlreadyWithdraw();

  return (
    <div className="px-6">
      <DashboardCard
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
      />
    </div>
  );
};

export default DashboardCards;
