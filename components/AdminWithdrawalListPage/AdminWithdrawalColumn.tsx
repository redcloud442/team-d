import { Button } from "@/components/ui/button";
import { formatDateToYYYYMMDD } from "@/utils/function";
import { WithdrawalRequestData } from "@/utils/types";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Copy } from "lucide-react";
import { Badge } from "../ui/badge";

const statusColorMap: Record<string, string> = {
  APPROVED: "bg-green-500",
};

export const AdminWithdrawalHistoryColumn =
  (): ColumnDef<WithdrawalRequestData>[] => {
    return [
      {
        accessorKey: "alliance_withdrawal_request_id",
        label: "Reference ID",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Reference ID <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => {
          const id = row.getValue("alliance_withdrawal_request_id") as string;
          const maxLength = 15;

          const handleCopy = async () => {
            if (id) {
              await navigator.clipboard.writeText(id);
            }
          };

          return (
            <div className="flex items-center space-x-2">
              <div
                className="truncate"
                title={id.length > maxLength ? id : undefined}
              >
                {id.length > maxLength ? `${id.slice(0, maxLength)}...` : id}
              </div>
              {id && (
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  <Copy />
                </Button>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "alliance_withdrawal_request_status",
        label: "Status",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => {
          const status = row.getValue(
            "alliance_withdrawal_request_status"
          ) as string;
          const color = statusColorMap[status.toUpperCase()] || "gray"; // Default to gray if status is undefined
          return <Badge className={`${color} text-white`}>{status}</Badge>;
        },
      },
      {
        accessorKey: "user_email",
        label: "Requestor Email",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Requestor Email <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("user_email")}</div>
        ),
      },
      {
        accessorKey: "alliance_withdrawal_request_amount",
        label: "Amount",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Amount <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => {
          const amount = parseFloat(
            row.getValue("alliance_withdrawal_request_amount")
          );
          const formatted = new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
          }).format(amount);
          return <div className="font-medium text-center">{formatted}</div>;
        },
      },
      {
        accessorKey: "alliance_withdrawal_request_type",
        label: "Bank Name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Bank Name <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-center">
            {row.getValue("alliance_withdrawal_request_type")}
          </div>
        ),
      },
      {
        accessorKey: "alliance_withdrawal_request_account",
        label: "Bank Account",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Bank Account <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-center">
            {row.getValue("alliance_withdrawal_request_account")}
          </div>
        ),
      },
      {
        accessorKey: "alliance_withdrawal_request_date",
        label: "Date Created",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date Created <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-center">
            {formatDateToYYYYMMDD(
              row.getValue("alliance_withdrawal_request_date")
            )}
          </div>
        ),
      },
    ];
  };
