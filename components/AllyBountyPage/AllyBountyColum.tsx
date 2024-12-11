import { Button } from "@/components/ui/button";
import { user_table } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export const AllyBountyColumn = (): ColumnDef<user_table>[] => {
  return [
    {
      accessorKey: "user_username",
      label: "Username",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Username <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("user_username")}</div>,
    },
    {
      accessorKey: "user_first_name",
      label: "First Name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          First Name <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("user_first_name")}</div>,
    },
    {
      accessorKey: "user_last_name",
      label: "Last Name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Name <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("user_last_name")}</div>,
    },
  ];
};
