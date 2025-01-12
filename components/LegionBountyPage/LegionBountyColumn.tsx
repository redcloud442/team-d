import { LegionRequestData } from "@/utils/types";
import { ColumnDef } from "@tanstack/react-table";

export const LegionBountyColumn = (): ColumnDef<LegionRequestData>[] => {
  return [
    {
      accessorKey: "user_username",
      header: () => (
        <div className="text-center text-lg font-bold">Username</div>
      ),
      cell: ({ row }) => {
        return <div>{row.getValue("user_username")}</div>;
      },
    },
    {
      accessorKey: "total_bounty_earnings",

      header: () => <div className="text-center text-lg font-bold">Amount</div>,
      cell: ({ row }) => (
        <div>
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
  ];
};
