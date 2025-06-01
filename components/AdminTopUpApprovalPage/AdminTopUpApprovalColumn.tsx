import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { logError } from "@/services/Error/ErrorLogs";
import { updateTopUpStatus } from "@/services/TopUp/Admin";
import { formatDateToYYYYMMDD, formatTime } from "@/utils/function";
import { createClientSide } from "@/utils/supabase/client";
import { AdminTopUpRequestData, TopUpRequestData } from "@/utils/types";
import { Column, ColumnDef, Row } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
import TableLoading from "../ui/tableLoading";
import { Textarea } from "../ui/textarea";
const statusColorMap: Record<string, string> = {
  APPROVED: "bg-green-500 dark:bg-green-600 dark:text-white",
  PENDING: "bg-yellow-600 dark:bg-yellow-700 dark:text-white",
  REJECTED: "bg-red-600 dark:bg-red-700 dark:text-white",
};

export const useAdminTopUpApprovalColumns = (
  reset: () => void,
  setRequestData: Dispatch<SetStateAction<AdminTopUpRequestData | null>>,
  status: string
) => {
  const { toast } = useToast();
  const router = useRouter();
  const supabaseClient = createClientSide();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState({
    open: false,
    requestId: "",
    status: "",
  });

  const handleUpdateStatus = async (
    status: string,
    requestId: string,
    note?: string
  ) => {
    try {
      setIsLoading(true);

      await updateTopUpStatus({
        status,
        requestId,
        note,
      });

      setRequestData((prev) => {
        if (!prev) return prev;

        const pendingData = prev.data["PENDING"]?.data ?? [];
        const updatedItem = pendingData.find(
          (item) => item.company_deposit_request_id === requestId
        );
        const newPendingList = pendingData.filter(
          (item) => item.company_deposit_request_id !== requestId
        );
        const currentStatusData = prev.data[status as keyof typeof prev.data];
        const hasExistingData = currentStatusData?.data?.length > 0;

        const merchantBalance =
          status === "APPROVED"
            ? (prev.merchantBalance || 0) -
              (updatedItem?.company_deposit_request_amount ?? 0)
            : prev.merchantBalance;

        if (!updatedItem) return prev;

        setIsOpenModal({ open: false, requestId: "", status: "" });
        return {
          ...prev,
          data: {
            ...prev.data,
            PENDING: {
              ...prev.data["PENDING"],
              data: newPendingList,
              count: Number(prev.data["PENDING"]?.count) - 1,
            },
            [status as keyof typeof prev.data]: {
              ...currentStatusData,
              data: hasExistingData
                ? [
                    {
                      ...updatedItem,
                      company_deposit_request_status: status,
                      company_deposit_request_date_updated: new Date(),
                    },
                    ...currentStatusData.data,
                  ]
                : [],
              count: Number(currentStatusData?.count || 0) + 1,
            },
          },
          merchantBalance: merchantBalance,
        };
      });
      toast({
        title: `Status Update`,
        description: `${status} Request Successfully`,
        variant: status === "APPROVED" ? "success" : "reject",
      });

      reset();
    } catch (e) {
      if (e instanceof Error) {
        await logError(supabaseClient, {
          errorMessage: e.message,
          stackTrace: e.stack,
          stackPath:
            "components/AdminTopUpApprovalPage/AdminTopUpApprovalColumn.tsx",
        });
        toast({
          title: `Invalid Request`,
          description: `${e.message}`,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnDef<TopUpRequestData>[] = [
    {
      accessorKey: "user_username",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "desc")}
        >
          Requestor Username <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div
          onClick={() =>
            router.push(`/admin/users/${row.original.company_member_id}`)
          }
          className="text-wrap cursor-pointer hover:underline text-blue-500"
        >
          {row.getValue("user_username")}
        </div>
      ),
    },
    {
      accessorKey: "company_deposit_request_status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "desc")}
        >
          Status <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        const status = row.getValue("company_deposit_request_status") as string;
        const color = statusColorMap[status.toUpperCase()] || "gray";
        return (
          <div className="flex justify-center items-center">
            <Badge className={`${color} text-white`}>{status}</Badge>
          </div>
        );
      },
    },

    {
      accessorKey: "company_deposit_request_amount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "desc")}
        >
          Amount <ArrowUpDown />
        </Button>
      ),
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
        <div className="text-wrap">
          {row.getValue("company_deposit_request_type")}
        </div>
      ),
    },
    {
      accessorKey: "company_deposit_request_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "desc")}
        >
          Bank Name <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-wrap">
          {row.getValue("company_deposit_request_name")}
        </div>
      ),
    },
    {
      accessorKey: "company_deposit_request_account",

      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "desc")}
        >
          Bank Number <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-wrap">
          {row.getValue("company_deposit_request_account")}
        </div>
      ),
    },
    {
      accessorKey: "company_deposit_request_date",

      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "desc")}
        >
          Date Created <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center w-40">
          {formatDateToYYYYMMDD(row.getValue("company_deposit_request_date"))},{" "}
          {formatTime(row.getValue("company_deposit_request_date"))}
        </div>
      ),
    },
    ...(status !== "PENDING"
      ? [
          {
            accessorKey: "approver_username",
            header: ({ column }: { column: Column<TopUpRequestData> }) => (
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
            cell: ({ row }: { row: Row<TopUpRequestData> }) => (
              <div className="text-wrap">
                {row.getValue("approver_username")}
              </div>
            ),
          },
        ]
      : []),
    ...(status !== "PENDING"
      ? [
          {
            accessorKey: "company_deposit_request_date_updated",
            header: ({ column }: { column: Column<TopUpRequestData> }) => (
              <Button
                variant="ghost"
                className="p-1"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
                }
              >
                Date Updated <ArrowUpDown />
              </Button>
            ),
            cell: ({ row }: { row: Row<TopUpRequestData> }) => (
              <div className="text-center w-40">
                {row.getValue("company_deposit_request_date_updated")
                  ? formatDateToYYYYMMDD(
                      row.getValue("company_deposit_request_date_updated")
                    ) +
                    "," +
                    formatTime(
                      row.getValue("company_deposit_request_date_updated")
                    )
                  : ""}
              </div>
            ),
          },
        ]
      : []),
    {
      accessorKey: "company_deposit_request_attachment",
      header: () => <div>Attachment</div>,
      cell: ({ row }) => {
        const attachmentUrl = row.getValue(
          "company_deposit_request_attachment"
        ) as string;

        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="rounded-md w-full" variant="outline">
                View Attachment
              </Button>
            </DialogTrigger>
            <DialogContent type="table">
              <DialogHeader>
                <DialogTitle>Attachment</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center items-center">
                <Image
                  key={attachmentUrl}
                  src={attachmentUrl}
                  alt="Attachment Preview"
                  width={600}
                  height={600}
                  placeholder="blur"
                  blurDataURL={attachmentUrl}
                  className="object-contain w-[600px] h-[600px]"
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
    ...(status !== "PENDING"
      ? [
          {
            accessorKey: "alliance_top_up_request_reject_note",
            header: () => <div>Rejection Note</div>,
            cell: ({ row }: { row: Row<TopUpRequestData> }) => {
              const rejectionNote = row.getValue(
                "alliance_top_up_request_reject_note"
              ) as string;

              return rejectionNote ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="rounded-md w-full" variant="destructive">
                      View Rejection Note
                    </Button>
                  </DialogTrigger>
                  <DialogContent type="table">
                    <DialogHeader>
                      <DialogTitle>Attachment</DialogTitle>
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
        ]
      : []),
    {
      header: "Actions",
      cell: ({ row }) => {
        const data = row.original;
        return (
          <>
            {data.company_deposit_request_status === "PENDING" && (
              <div className="flex gap-2">
                <Button
                  className="bg-green-500 hover:bg-green-600 dark:bg-green-500 dark:text-white"
                  onClick={() =>
                    setIsOpenModal({
                      open: true,
                      requestId: data.company_deposit_request_id,
                      status: "APPROVED",
                    })
                  }
                >
                  Approve
                </Button>

                <Button
                  variant="destructive"
                  onClick={() =>
                    setIsOpenModal({
                      open: true,
                      requestId: data.company_deposit_request_id,
                      status: "REJECTED",
                    })
                  }
                >
                  Reject
                </Button>
              </div>
            )}
          </>
        );
      },
    },
  ];

  if (isLoading) {
    <TableLoading />;
  }

  return {
    columns,
    isOpenModal,
    setIsOpenModal,
    handleUpdateStatus,
    isLoading,
  };
};
