import { Button } from "@/components/ui/button";
import { useUserHaveAlreadyWithdraw } from "@/store/useWithdrawalToday";
import Link from "next/link";

const DashboardCards = () => {
  const { isWithdrawalToday, canUserDeposit } = useUserHaveAlreadyWithdraw();

  return (
    <div className="flex flex-col gap-3">
      <Link
        href={canUserDeposit ? "/request/deposit" : "/digi-dash"}
        className="w-full"
      >
        <Button
          disabled={!canUserDeposit}
          className="h-12 text-xl font-bold w-full"
        >
          Deposit
        </Button>
      </Link>

      <Link href="/subscription" className="w-full">
        <Button className="h-12 text-xl font-bold w-full">
          Subscribe to Earn
        </Button>
      </Link>
      <Link
        href={
          isWithdrawalToday.referral && isWithdrawalToday.package
            ? "/request/withdraw"
            : "/digi-dash"
        }
        className="w-full"
      >
        <Button
          disabled={!isWithdrawalToday.referral && !isWithdrawalToday.package}
          className="h-12 text-xl font-bold w-full"
        >
          Withdraw
        </Button>
      </Link>

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
