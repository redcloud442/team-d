import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateWithdrawalStatus } from "@/services/Withdrawal/Admin";
import { formatDateToYYYYMMDD } from "@/utils/function";
import { WithdrawalRequestData } from "@/utils/types";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Copy } from "lucide-react";
import { useCallback, useState } from "react";
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

export const AdminWithdrawalHistoryColumn = (handleFetch: () => void) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState({
    open: false,
    requestId: "",
    status: "",
  });

  const handleUpdateStatus = useCallback(
    async (status: string, requestId: string, note?: string) => {
      try {
        setIsLoading(true);
        await updateWithdrawalStatus({ status, requestId, note });
        handleFetch();
        toast({
          title: `Status Update`,
          description: `${status} Request Successfully`,
          variant: "success",
        });
        setIsOpenModal({ open: false, requestId: "", status: "" });
      } catch (e) {
        toast({
          title: `Status Failed`,
          description: `Something went wrong`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [handleFetch, toast]
  );

  const columns: ColumnDef<WithdrawalRequestData>[] = [
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

    {
      accessorKey: "approver_username",
      label: "Approver",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Approver <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("approver_username")}</div>
      ),
    },
    {
      accessorKey: "alliance_withdrawal_request_reject_note",
      label: "Rejection Note",
      header: () => <div>Rejection Note</div>,
      cell: ({ row }) => {
        const rejectionNote = row.getValue(
          "alliance_withdrawal_request_reject_note"
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

  return {
    columns,
    isOpenModal,
    setIsOpenModal,
    handleUpdateStatus,
    isLoading,
  };
};
