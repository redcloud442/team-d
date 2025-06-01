import { formatNumberLocale } from "@/utils/function";
import { LegionRequestData } from "@/utils/types";
import { ColumnDefinition } from "../ReusableCardList/ReusableCardList"; // adjust import path as needed

export const LegionBountyColumn = (): ColumnDefinition<LegionRequestData>[] => {
  return [
    {
      header: <span>Full Name</span>,
      render: (item, index?: number) => (
        <div className="text-start text-[10px] sm:text-[12px] text-bg-primary-blue">
          {index !== undefined ? index + 1 : ""}. {item.user_first_name}{" "}
          {item.user_last_name}
        </div>
      ),
    },
    {
      header: "Username",
      render: (item) => (
        <div className="text-start text-[10px] sm:text-[12px]">
          {item.user_username}
        </div>
      ),
    },
    {
      header: "Sponsor Username",
      render: (item) => (
        <div className="text-start text-[10px] sm:text-[12px]">
          {item.referrer_username}
        </div>
      ),
    },
    {
      header: "Amount",
      render: (item) => (
        <div className="text-start text-[10px] sm:text-[12px]">
          ₱ {formatNumberLocale(Number(item.total_bounty_earnings))}
        </div>
      ),
    },
  ];
};
