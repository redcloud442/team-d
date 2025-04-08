import { memo } from "react";
import { Button } from "../ui/button";

type Props = {
  amountToReinvest: number;
  percentage: number;
  bonus: number;
  months: number;
  type: "1 month" | "3 months" | "5 months";
  handleReinvestMonthly: (
    amount: number,
    bonus: number,
    months: number,
    type: "1 month" | "3 months" | "5 months",
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
  const amountWithPercentage = amountToReinvest * (percentage / 100);
  const amountWithBonus = amountToReinvest * (bonus / 100);
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
      className="w-full flex flex-col items-center justify-center gap-2 border-2 border-amber-400 rounded-md p-1"
    >
      <p className="text-[10px] sm:text-lg text-center">+ {bonus}% Bonus</p>
      <p className="text-[10px] sm:text-lg text-center">+ {percentage}%</p>
      <p className="text-[10px] sm:text-lg text-center">
        [ {months} {months === 1 ? "MONTH" : "MONTHS"} ]
      </p>

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
