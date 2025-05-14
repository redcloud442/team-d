import { formatDateToYYYYMMDD, formatTime } from "@/utils/function";
import { LegionRequestData } from "@/utils/types";
import { ColumnDef } from "@tanstack/react-table";

export const LegionBountyColumn = (): ColumnDef<LegionRequestData>[] => {
  return [
    {
      // Index column
      id: "package_ally_bounty_log_date_created",
      header: () => <div className="text-start text-xs font-bold">Date</div>,
      cell: ({ row }) => (
        <div className="text-start text-[10px] sm:text-[12px] w-auto">
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
        <div className="text-start text-xs font-bold w-auto">Username</div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-start text-[10px] sm:text-[12px] w-auto">
            {row.getValue("user_username")}
          </div>
        );
      },
    },
    {
      accessorKey: "total_bounty_earnings",

      header: () => <div className="text-start text-xs font-bold">Amount</div>,
      cell: ({ row }) => (
        <div className="text-start text-[10px] sm:text-[12px]">
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
      accessorKey: "company_referral_date",
      header: () => (
        <div className="text-start font-bold text-xs w-auto p-0">
          Invite Date
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-start text-[10px] sm:text-[12px]">
          {formatDateToYYYYMMDD(row.original.company_referral_date)}
        </div>
      ),
    },
  ];
};
