import { formatDateToYYYYMMDD, formatTime } from "@/utils/function";
import { user_table } from "@/utils/types";
import { ColumnDefinition } from "../ReusableCardList/ReusableCardList";

export type AllyBountyRow = user_table & {
  total_bounty_earnings: string;
  package_ally_bounty_log_date_created: Date;
  company_referral_date: Date;
};

export const AllyBountyColumn = (): ColumnDefinition<AllyBountyRow>[] => {
  return [
    {
      header: "Date",
      render: (item: AllyBountyRow) => (
        <div className="text-start text-[10px] sm:text-[12px]">
          {formatDateToYYYYMMDD(item.package_ally_bounty_log_date_created)},{" "}
          {formatTime(item.package_ally_bounty_log_date_created)}
        </div>
      ),
    },
    {
      header: "Username",
      render: (item: AllyBountyRow) => (
        <div className="text-start text-[10px] sm:text-[12px]">
          {item.user_username}
        </div>
      ),
    },
    {
      header: "Amount",
      render: (item: AllyBountyRow) => (
        <div className="text-start text-[10px] sm:text-[12px]">
          ₱{" "}
          {Number(item.total_bounty_earnings).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },
    {
      header: "Invite Date",
      render: (item: AllyBountyRow) => (
        <div className="text-start text-[10px] sm:text-[12px]">
          {formatDateToYYYYMMDD(item.company_referral_date)}
        </div>
      ),
    },
  ];
};
