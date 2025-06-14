import { formatDateToYYYYMMDD, formatNumberLocale } from "@/utils/function";
import { ReferralType, user_table } from "@/utils/types";
import { ColumnDefinition } from "../ReusableCardList/ReusableCardList";

export type AllyBountyRow = user_table & {
  total_bounty_earnings: number;
  package_ally_bounty_log_date_created: Date;
  company_referral_date: Date;
};

export const AllyBountyColumn = (
  type: ReferralType
): ColumnDefinition<AllyBountyRow>[] => {
  return [
    {
      header: "Username",
      render: (item: AllyBountyRow, index?: number) => (
        <div className="text-start text-[10px] sm:text-[12px] w-full">
          {(index ?? 0) + 1}. {item.user_username}
        </div>
      ),
    },
    {
      header: "Full Name",
      render: (item: AllyBountyRow) => (
        <div className="text-start text-[10px] sm:text-[12px] w-full">
          {item.user_first_name} {item.user_last_name}
        </div>
      ),
    },
    ...(type !== "new-register"
      ? [
          {
            header: "Username",
            render: (item: AllyBountyRow) => (
              <div className="text-start text-[10px] sm:text-[12px]">
                ₱ {formatNumberLocale(item?.total_bounty_earnings)}
              </div>
            ),
          },
        ]
      : [
          {
            header: "Username",
            render: (item: AllyBountyRow) => (
              <div className="text-start text-[10px] sm:text-[12px]">
                {formatDateToYYYYMMDD(item?.company_referral_date)}
              </div>
            ),
          },
        ]),
  ];
};
