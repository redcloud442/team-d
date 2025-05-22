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
      header: (
        <span>
          <span className="text-bg-primary-blue">YOU</span> Full Name
        </span>
      ),
      render: (item: AllyBountyRow) => (
        <div className="text-start text-[10px] sm:text-[12px]">
          {item.user_first_name} {item.user_last_name}
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
  ];
};
