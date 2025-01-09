import { Button } from "@/components/ui/button";
import { formatDateToYYYYMMDD } from "@/utils/function";
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
    // {
    //   accessorKey: "alliance_top_up_request_id",
    //   header: ({ column }) => (
    //     <Button
    //       variant="ghost"
    //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //     >
    //       Reference ID <ArrowUpDown />
    //     </Button>
    //   ),
    //   cell: ({ row }) => {
    //     const requestId = row.getValue("alliance_top_up_request_id") as string;

    //     const maxLength = 15;

    //     const handleCopy = async () => {
    //       if (requestId) {
    //         await navigator.clipboard.writeText(requestId);
    //       }
    //     };

    //     return (
    //       <div className="flex items-center space-x-2">
    //         <div
    //           className="truncate"
    //           title={requestId.length > maxLength ? requestId : undefined}
    //         >
    //           {requestId.length > maxLength
    //             ? `${requestId.slice(0, maxLength)}...`
    //             : requestId}
    //         </div>
    //         {requestId && (
    //           <Button variant="ghost" size="sm" onClick={handleCopy}>
    //             <Copy />
    //           </Button>
    //         )}
    //       </div>
    //     );
    //   },
    // },
    {
      accessorKey: "alliance_top_up_request_status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        const status = row.getValue("alliance_top_up_request_status") as string;
        const color = statusColorMap[status.toUpperCase()] || "gray"; // Default to gray if status is undefined
        return (
          <Badge className={`${color} text-white dark:text-white`}>
            {status}
          </Badge>
        );
      },
    },

    {
      accessorKey: "alliance_top_up_request_amount",
      header: () => <Button variant="ghost">Amount</Button>,
      cell: ({ row }) => {
        const amount = parseFloat(
          row.getValue("alliance_top_up_request_amount")
        );
        const formatted = new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(amount);
        return <div className="font-medium text-center">{formatted}</div>;
      },
    },
    {
      accessorKey: "alliance_top_up_request_name",
      header: () => <Button variant="ghost">Bank Name</Button>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue("alliance_top_up_request_name")}
        </div>
      ),
    },
    {
      accessorKey: "alliance_top_up_request_account",
      header: () => (
        <Button variant="ghost">
          Bank Account <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue("alliance_top_up_request_account")}
        </div>
      ),
    },
    {
      accessorKey: "alliance_top_up_request_date",
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
          {formatDateToYYYYMMDD(row.getValue("alliance_top_up_request_date"))}
        </div>
      ),
    },
    {
      accessorKey: "alliance_top_up_request_reject_note",
      header: () => <div>Rejection Note</div>,
      cell: ({ row }) => {
        const rejectionNote = row.getValue(
          "alliance_top_up_request_reject_note"
        ) as string;

        return rejectionNote ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">View Rejection Note</Button>
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
