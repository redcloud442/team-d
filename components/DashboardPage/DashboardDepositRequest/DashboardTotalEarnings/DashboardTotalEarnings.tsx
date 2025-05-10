import ReusableCard from "@/components/ui/card-reusable";
import LoaderBounce from "@/components/ui/loader-bounce";
import { useUserDashboardEarningsStore } from "@/store/useUserDashboardEarnings";
import { formatNumberLocale } from "@/utils/function";
import ReusableCardBg from "../../DashboardCardBg/DashboardCardBg";

type DashboardTotalEarningsProps = {
  refresh: boolean;
};

const DashboardTotalEarnings = ({ refresh }: DashboardTotalEarningsProps) => {
  const { totalEarnings } = useUserDashboardEarningsStore();
  return (
    <ReusableCard type="user" className="p-0 space-y-4">
      <div className="flex flex-row justify-between md:justify-between items-start md:items-center md:px-32 gap-4">
        <ReusableCardBg className="p-2 text-center">
          <p className="text-xs sm:text-2xl font-black">TOTAL INCOME</p>

          <div className="text-xl sm:text-3xl font-extrabold">
            {refresh ? (
              <div className="flex items-center justify-center gap-2 pt-5">
                <LoaderBounce />
              </div>
            ) : (
              "₱ " + formatNumberLocale(totalEarnings?.totalEarnings ?? 0)
            )}
          </div>
        </ReusableCardBg>

        {/* Total Withdrawal Section */}
        <ReusableCardBg className="p-2 text-center">
          <p className="text-xs sm:text-xl font-black">TOTAL WITHDRAW</p>

          <div className="text-xl sm:text-3xl font-extrabold">
            {refresh ? (
              <div className="flex items-center justify-center gap-4 pt-5">
                <LoaderBounce />
              </div>
            ) : (
              "₱ " + formatNumberLocale(totalEarnings?.withdrawalAmount ?? 0)
            )}
          </div>
        </ReusableCardBg>
      </div>

      <div className="flex flex-row sm:flex-row justify-evenly gap-3 sm:gap-8 sm:px-6">
        {/* Package Income */}
        <ReusableCardBg className="p-2 text-center">
          <p className="text-[10px] w-full sm:text-lg font-black">
            TRADING INCOME
          </p>
          <div className="text-sm sm:text-lg font-bold">
            {refresh ? (
              <div className="flex items-center justify-center gap-4 pt-3">
                <LoaderBounce />
              </div>
            ) : (
              "₱ " + formatNumberLocale(totalEarnings?.packageEarnings ?? 0)
            )}
          </div>
        </ReusableCardBg>

        {/* Referral Income */}
        <ReusableCardBg className="p-2 text-center">
          <p className="text-[10px] w-full sm:text-lg font-black">
            REFERRAL INCOME
          </p>
          <div className="text-sm sm:text-lg font-bold">
            {refresh ? (
              <div className="flex items-center justify-center gap-2 pt-3">
                <LoaderBounce />
              </div>
            ) : (
              "₱ " +
              formatNumberLocale(totalEarnings?.directReferralAmount ?? 0)
            )}
          </div>
        </ReusableCardBg>

        {/* Network Income */}
        <ReusableCardBg className="p-2 text-center">
          <p className="text-[10px] w-full sm:text-lg font-black">
            NETWORK INCOME
          </p>
          <div className="text-sm sm:text-lg font-bold">
            {refresh ? (
              <div className="flex items-center justify-center gap-2 pt-3">
                <LoaderBounce />
              </div>
            ) : (
              "₱ " +
              formatNumberLocale(totalEarnings?.indirectReferralAmount ?? 0)
            )}
          </div>
        </ReusableCardBg>
      </div>
    </ReusableCard>
  );
};

export default DashboardTotalEarnings;
