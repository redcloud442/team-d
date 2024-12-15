import { Button } from "@/components/ui/button";
import { formatDateToYYYYMMDD } from "@/utils/function";
import { PackageHistoryData } from "@/utils/types";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "../ui/badge";

export const usePackageHistoryColumns = () => {
  const columns: ColumnDef<PackageHistoryData>[] = [
    {
      accessorKey: "package_name",

      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Package Name <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-wrap">{row.getValue("package_name")}</div>
      ),
    },
    {
      accessorKey: "package_member_connection_created",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date Created <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-wrap">
            {formatDateToYYYYMMDD(
              row.getValue("package_member_connection_created")
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "package_member_amount_earnings",

      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          ₱{" "}
          {(
            row.getValue("package_member_amount_earnings") as number
          ).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "package_member_status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Package Status <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge className="text-center bg-green-500 text-white dark:bg-green-600">
          {row.getValue("package_member_status")}
        </Badge>
      ),
    },
  ];

  return {
    columns,
  };
};
