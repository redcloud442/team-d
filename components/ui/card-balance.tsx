import { formatNumberLocale } from "@/utils/function";
import { package_table } from "@prisma/client";
import { RefreshCcw } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import ReusableCardBg from "../DashboardPage/DashboardCardBg/DashboardCardBg";
import DashboardReinvestPromoPackage from "../DashboardPage/DashboardReinvestPromoPackage/DashboardReinvestPromoPackage";
import { Button } from "./button";
import LoaderBounce from "./loader-bounce";

type Props = {
  value: number;
  children?: React.ReactNode;
  handleClick?: () => void;
  refresh?: boolean;
  packages: package_table[];
  setIsActive: Dispatch<SetStateAction<boolean>>;
  active: boolean;
};

const CardBalance = ({ value, handleClick, refresh, packages }: Props) => {
  return (
    <ReusableCardBg
      className="p-2 text-center text-xl font-bold"
      title={"AVAILABLE WALLET BALANCE"}
    >
      <div className="flex items-center justify-center gap-4 py-2">
        {/* Earnings display */}

        {/* Optional Refresh Button */}
        {handleClick && (
          <Button
            variant="ghost"
            className="px-2 bg-red-500 text-white rounded-full"
            onClick={handleClick}
          >
            <RefreshCcw />
          </Button>
        )}

        {/* Conditional Loading or Value Display */}
        <div className="text-lg font-semibold">
          {refresh ? (
            <div className="flex items-center gap-2">
              <LoaderBounce />
            </div>
          ) : (
            <span className="text-lg font-bold">
              ₱ {formatNumberLocale(value ?? 0)}
            </span>
          )}
        </div>
      </div>

      <DashboardReinvestPromoPackage className="w-full" packages={packages} />
    </ReusableCardBg>
  );
};

export default CardBalance;
