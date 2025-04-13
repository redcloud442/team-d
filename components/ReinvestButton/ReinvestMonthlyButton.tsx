import { memo } from "react";
import { Button } from "../ui/button";
type Props = {
  amountToReinvest: number;
  percentage: number;
  bonus: number;
  months: number;
  type: "9 days" | "12 days" | "14 days" | "1 month" | "3 months" | "5 months";
  handleReinvestMonthly: (
    amount: number,
    bonus: number,
    months: number,
    type:
      | "9 days"
      | "12 days"
      | "14 days"
      | "1 month"
      | "3 months"
      | "5 months",
    amountWithbonus: number,
    amountWithPercentage: number,
    percentage: number
  ) => void;
};

const ReinvestMonthlyButton = ({
  amountToReinvest,
  percentage,
  bonus,
  months,
  type,
  handleReinvestMonthly,
}: Props) => {
  const bonusChecker = amountToReinvest < 200 ? 0 : bonus;
  const amountWithPercentage = amountToReinvest * (percentage / 100);
  const amountWithBonus = amountToReinvest * (bonusChecker / 100);

  const amountToReinvestWithBonus =
    amountToReinvest + amountWithBonus + amountWithPercentage;

  return (
    <div
      onClick={() =>
        handleReinvestMonthly(
          amountToReinvestWithBonus,
          bonus,
          months,
          type,
          amountWithBonus,
          amountWithPercentage,
          percentage
        )
      }
      className="w-full flex flex-col items-center justify-center gap-2 border-2 border-amber-400 rounded-md p-1 cursor-pointer hover:bg-amber-400/20"
    >
      <p className="text-md sm:text-xl font-extrabold text-center">
        {months === 0 ? null : months}{" "}
        {months === 1 ? "Month" : months === 0 ? "9 Days" : "Months"}
      </p>

      {bonusChecker !== 0 && (
        <p className="text-md sm:text-lg text-center">
          + {bonusChecker}% Bonus
        </p>
      )}
      <p className="text-md sm:text-lg text-center">+ {percentage}% Profit</p>

      <Button
        type="button"
        variant="ghost"
        className="w-full text-2xl font-extrabold p-0 dark:hover:bg-transparent"
      >
        ₱{" "}
        {amountToReinvestWithBonus.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Button>
    </div>
  );
};

export default memo(ReinvestMonthlyButton);
