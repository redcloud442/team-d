import { Button } from "@/components/ui/button";
import { formatDateToYYYYMMDD, formatTime } from "@/utils/function";
import { WithdrawalRequestData } from "@/utils/types";
import { DialogClose } from "@radix-ui/react-dialog";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";

const statusColorMap: Record<string, string> = {
  APPROVED: "bg-green-500 dark:bg-green-600 dark:text-white",
  REJECTED: "bg-red-500 dark:bg-red-600 dark:text-white",
  PENDING: "bg-yellow-500 dark:bg-yellow-600 dark:text-white",
};

export const WithdrawalHistoryColumn =
  (): ColumnDef<WithdrawalRequestData>[] => {
    return [
      {
        accessorKey: "company_withdrawal_request_status",

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
            "company_withdrawal_request_status"
          ) as string;
          const color = statusColorMap[status.toUpperCase()] || "gray"; // Default to gray if status is undefined
          return (
            <div className="flex justify-center items-center">
              <Badge className={`${color} text-white`}>{status}</Badge>
            </div>
          );
        },
      },
      {
        accessorKey: "company_withdrawal_request_amount",
        header: () => <Button variant="ghost">Amount</Button>,
        cell: ({ row }) => {
          const amount = parseFloat(
            row.getValue("company_withdrawal_request_amount")
          );
          const fee = row.original.company_withdrawal_request_fee;
          const formatted = new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
          }).format(amount - fee);
          return <div className="font-medium text-center">{formatted}</div>;
        },
      },
      {
        accessorKey: "company_withdrawal_request_type",

        header: ({ column }) => (
          <Button
            variant="ghost"
            className="p-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Bank Type
            <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-center">
            {row.getValue("company_withdrawal_request_type")}
          </div>
        ),
      },
      {
        accessorKey: "company_withdrawal_request_account",

        header: ({ column }) => (
          <Button
            variant="ghost"
            className="p-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Bank Account <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-center">
            {row.getValue("company_withdrawal_request_account")}
          </div>
        ),
      },
      {
        accessorKey: "company_withdrawal_request_bank_name",

        header: ({ column }) => (
          <Button
            variant="ghost"
            className="p-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Bank Name <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-center">
            {row.getValue("company_withdrawal_request_bank_name")}
          </div>
        ),
      },
      {
        accessorKey: "company_withdrawal_request_date",

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
              row.getValue("company_withdrawal_request_date")
            )}
            , {formatTime(row.getValue("company_withdrawal_request_date"))}
          </div>
        ),
      },
      {
        accessorKey: "approver_username",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="p-1"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "desc")
            }
          >
            Approver <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("approver_username")}</div>
        ),
      },
      {
        accessorKey: "company_withdrawal_request_date_updated",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="p-1"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "desc")
            }
          >
            Date Updated <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-wrap">
            {row.getValue("company_withdrawal_request_date_updated")
              ? formatDateToYYYYMMDD(
                  row.getValue("company_withdrawal_request_date_updated")
                ) +
                "," +
                formatTime(
                  row.getValue("company_withdrawal_request_date_updated")
                )
              : ""}
          </div>
        ),
      },
      {
        accessorKey: "company_withdrawal_request_reject_note",
        header: () => <div>Rejection Note</div>,
        cell: ({ row }) => {
          const rejectionNote = row.getValue(
            "company_withdrawal_request_reject_note"
          ) as string;

          return rejectionNote ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full rounded-md" variant="destructive">
                  View Rejection Note
                </Button>
              </DialogTrigger>
              <DialogContent type="table">
                <DialogHeader>
                  <DialogTitle>Rejection Note</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center items-center">
                  <Textarea value={rejectionNote} readOnly />
                </div>
                <DialogClose asChild>
                  <Button variant="secondary">Close</Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          ) : null;
        },
      },
    ];
  };
