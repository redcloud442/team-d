import { Button } from "@/components/ui/button";
import { user_table } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

export const AdminUserMonitoringColumn = (): ColumnDef<user_table>[] => {
  const router = useRouter();
  return [
    {
      accessorKey: "user_username",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Username
        </Button>
      ),
      cell: ({ row }) => {
        const id = row.original.user_id;

        return (
          <div
            onClick={() => router.push(`/admin/users/${id}`)}
            className="text-wrap cursor-pointer hover:underline text-blue-500"
          >
            {row.getValue("user_username")}
          </div>
        );
      },
    },
    {
      accessorKey: "user_first_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          First Name
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-wrap">{row.getValue("user_first_name")}</div>
      ),
    },
    {
      accessorKey: "user_last_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Name
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-wrap">{row.getValue("user_last_name")}</div>
      ),
    },
  ];
};
