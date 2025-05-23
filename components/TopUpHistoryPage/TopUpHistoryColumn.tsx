import { Button } from "@/components/ui/button";
import { formatDateToYYYYMMDD, formatTime } from "@/utils/function";
import { TopUpRequestData } from "@/utils/types";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";

const statusColorMap: Record<string, string> = {
  APPROVED: "bg-green-500 dark:bg-green-600",
  PENDING: "bg-yellow-600 dark:bg-yellow-700",
  REJECTED: "bg-red-600 dark:bg-red-700",
};

export const TopUpHistoryColumn = (): ColumnDef<TopUpRequestData>[] => {
  return [
    {
      accessorKey: "company_deposit_request_status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        const status = row.getValue("company_deposit_request_status") as string;
        const color = statusColorMap[status.toUpperCase()] || "gray"; // Default to gray if status is undefined
        return (
          <div className="flex justify-center items-center">
            <Badge className={`${color} text-white dark:text-white`}>
              {status}
            </Badge>
          </div>
        );
      },
    },

    {
      accessorKey: "company_deposit_request_amount",
      header: () => <Button variant="ghost">Amount</Button>,
      cell: ({ row }) => {
        const amount = parseFloat(
          row.getValue("company_deposit_request_amount")
        );
        const formatted = new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(amount);
        return <div className="font-medium text-center">{formatted}</div>;
      },
    },
    {
      accessorKey: "company_deposit_request_type",
      header: () => <Button variant="ghost">Bank Name</Button>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue("company_deposit_request_type")}
        </div>
      ),
    },
    {
      accessorKey: "company_deposit_request_name",
      header: () => <Button variant="ghost">Account Name</Button>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue("company_deposit_request_name")}
        </div>
      ),
    },
    {
      accessorKey: "company_deposit_request_account",
      header: () => (
        <Button variant="ghost">
          Bank Account <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue("company_deposit_request_account")}
        </div>
      ),
    },
    {
      accessorKey: "company_deposit_request_date",
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
          {formatDateToYYYYMMDD(row.getValue("company_deposit_request_date"))},{" "}
          {formatTime(row.getValue("company_deposit_request_date"))}
        </div>
      ),
    },
    {
      accessorKey: "company_deposit_request_reject_note",
      header: () => <div>Rejection Note</div>,
      cell: ({ row }) => {
        const rejectionNote = row.getValue(
          "company_deposit_request_reject_note"
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
