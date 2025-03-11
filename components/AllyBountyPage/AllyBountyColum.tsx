import { formatDateToYYYYMMDD, formatTime } from "@/utils/function";
import { user_table } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

export const AllyBountyColumn = (): ColumnDef<
  user_table & {
    total_bounty_earnings: string;
    package_ally_bounty_log_date_created: Date;
    alliance_referral_date: Date;
  }
>[] => {
  return [
    {
      // Index column
      id: "package_ally_bounty_log_date_created",
      header: () => (
        <div className="text-center text-xs font-bold w-auto p-0">Date</div>
      ),
      cell: ({ row }) => (
        <div className="text-center text-[10px] sm:text-[12px]">
          {formatDateToYYYYMMDD(
            row.original.package_ally_bounty_log_date_created
          )}
          , {formatTime(row.original.package_ally_bounty_log_date_created)}
        </div>
      ),
    },

    {
      accessorKey: "user_username",
      header: () => (
        <div className="text-center text-xs font-bold w-auto p-0">Username</div>
      ),
      cell: ({ row }) => (
        <div className="truncate text-[10px] sm:text-[12px]">
          {row.getValue("user_username")}
        </div>
      ),
    },
    {
      accessorKey: "total_bounty_earnings",
      header: () => (
        <div className="text-center text-xs font-bold w-auto p-0">Amount</div>
      ),
      cell: ({ row }) => (
        <div className="text-wrap text-[10px] sm:text-[12px]">
          ₱{" "}
          {Number(row.getValue("total_bounty_earnings")).toLocaleString(
            "en-US",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )}
        </div>
      ),
    },
    {
      accessorKey: "alliance_referral_date",
      header: () => (
        <div className="text-center font-bold text-xs w-auto p-0">
          Invite Date
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center text-[10px] sm:text-[12px]">
          {formatDateToYYYYMMDD(row.original.alliance_referral_date)}
        </div>
      ),
    },
  ];
};
