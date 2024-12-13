import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { logError } from "@/services/Error/ErrorLogs";
import { updateTopUpStatus } from "@/services/TopUp/Admin";
import { formatDateToYYYYMMDD } from "@/utils/function";
import { createClientSide } from "@/utils/supabase/client";
import { TopUpRequestData } from "@/utils/types";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Copy, MoreHorizontal } from "lucide-react";
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
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Textarea } from "../ui/textarea";

const statusColorMap: Record<string, string> = {
  APPROVED: "bg-green-500",
  PENDING: "bg-yellow-600",
  REJECTED: "bg-red-600",
};

export const TopUpColumn = (handleFetch: () => void) => {
  const { toast } = useToast();
  const supabaseClient = createClientSide();
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
        await updateTopUpStatus({
          status,
          requestId,
          note,
        });
        handleFetch();
        toast({
          title: `Status Update`,
          description: `${status} Request Successfully`,
          variant: "success",
        });
        setIsOpenModal({ open: false, requestId: "", status: "" });
      } catch (e) {
        if (e instanceof Error) {
          await logError(supabaseClient, {
            errorMessage: e.message,
            stackTrace: e.stack,
            stackPath:
              "components/AdminTopUpApprovalPage/AdminTopUpApprovalColumn.tsx",
          });
        }
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

  const columns: ColumnDef<TopUpRequestData>[] = [
    {
      accessorKey: "alliance_top_up_request_id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Reference ID <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        const id = row.getValue("alliance_top_up_request_id") as string;
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
        return <Badge className={`${color} text-white`}>{status}</Badge>;
      },
    },
    {
      accessorKey: "alliance_top_up_request_amount",

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
      accessorKey: "alliance_top_up_request_type",

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
          {row.getValue("alliance_top_up_request_type")}
        </div>
      ),
    },
    {
      accessorKey: "alliance_top_up_request_name",

      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue("alliance_top_up_request_name")}
        </div>
      ),
    },
    {
      accessorKey: "alliance_top_up_request_account",

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
      accessorKey: "alliance_top_up_request_attachment",

      header: () => <div>Attachment</div>,
      cell: ({ row }) => {
        const attachmentUrl = row.getValue(
          "alliance_top_up_request_attachment"
        ) as string;

        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">View Attachment</Button>
            </DialogTrigger>
            <DialogContent type="table">
              <DialogHeader>
                <DialogTitle>Attachment</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center items-center">
                <iframe
                  src={attachmentUrl || ""}
                  className="w-full h-96"
                  title="Attachment Preview"
                />
              </div>
              <DialogClose asChild>
                <Button variant="secondary">Close</Button>
              </DialogClose>
            </DialogContent>
          </Dialog>
        );
      },
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
    {
      header: "Actions",
      cell: ({ row }) => {
        const data = row.original;
        return (
          <DropdownMenu>
            {data.alliance_top_up_request_status === "PENDING" && (
              <>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() =>
                      setIsOpenModal({
                        open: true,
                        requestId: data.alliance_top_up_request_id,
                        status: "APPROVED",
                      })
                    }
                  >
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      setIsOpenModal({
                        open: true,
                        requestId: data.alliance_top_up_request_id,
                        status: "REJECTED",
                      })
                    }
                  >
                    Reject
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </>
            )}
          </DropdownMenu>
        );
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
