import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { logError } from "@/services/Error/ErrorLogs";
import { updateWithdrawalStatus } from "@/services/Withdrawal/Admin";
import { formatDateToYYYYMMDD, formatTime } from "@/utils/function";
import { createClientSide } from "@/utils/supabase/client";
import { AdminWithdrawaldata, WithdrawalRequestData } from "@/utils/types";
import { Column, ColumnDef, Row } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import AdminWithdrawalModal from "../AdminWithdrawalListPage/AdminWithdrawalModal";
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
import ActiveTreeModal from "../UserAdminProfile/ActiveTreeModal/ActiveTreeModal";

const statusColorMap: Record<string, string> = {
  APPROVED: "bg-green-500 dark:bg-green-600 dark:text-white ",
  PENDING: "bg-yellow-600 dark:bg-yellow-700 dark:text-white ",
  REJECTED: "bg-red-600 dark:bg-red-700 dark:text-white ",
};

export const WithdrawalColumn = (
  reset: () => void,
  setRequestData: Dispatch<SetStateAction<AdminWithdrawaldata | null>>,
  status: "PENDING" | "REJECTED" | "APPROVED",
  hidden: boolean,
  role: string
) => {
  const { toast } = useToast();
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
      await updateWithdrawalStatus({ status, requestId, note });

      setRequestData((prev) => {
        if (!prev) return prev;

        // Extract PENDING data and filter out the item being updated
        const pendingData = prev.data["PENDING"]?.data ?? [];
        const updatedItem = pendingData.find(
          (item) => item.company_withdrawal_request_id === requestId
        );
        const newPendingList = pendingData.filter(
          (item) => item.company_withdrawal_request_id !== requestId
        );
        const currentStatusData = prev.data[status as keyof typeof prev.data];
        const hasExistingData = currentStatusData?.data?.length > 0;

        if (!updatedItem) return prev;

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
                      company_withdrawal_request_status: status,
                    },
                    ...currentStatusData.data,
                  ]
                : [],
              count: Number(currentStatusData?.count || 0) + 1,
            },
          },

          totalPendingWithdrawal:
            Number(prev.totalPendingWithdrawal || 0) -
            Number(
              updatedItem.company_withdrawal_request_amount -
                updatedItem.company_withdrawal_request_fee
            ),
          totalApprovedWithdrawal:
            status === "APPROVED"
              ? (prev?.totalApprovedWithdrawal || 0) +
                updatedItem.company_withdrawal_request_amount
              : prev?.totalApprovedWithdrawal || 0,
        };
      });
      reset();
      setIsOpenModal({ open: false, requestId: "", status: "" });
      toast({
        title: `Status Update`,
        description: `${status} Request Successfully`,
      });
    } catch (e) {
      if (e instanceof Error) {
        await logError(supabaseClient, {
          errorMessage: e.message,
          stackTrace: e.stack,
          stackPath: "components/WithdrawalPage/WithdrawalColumn.tsx",
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
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: ColumnDef<WithdrawalRequestData>[] = [
    {
      accessorKey: "user_username",

      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Requestor Username <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="w-full ">
          <div className="flex justify-between items-center gap-2">
            <p>{row.getValue("user_username")}</p>
            <AdminWithdrawalModal
              status={status}
              hiddenUser={hidden}
              setRequestData={setRequestData}
              user_userName={row.getValue("user_username")}
              company_member_id={row.original.company_member_id}
            />
          </div>
        </div>
      ),
    },
    {
      accessorKey: "company_member_id",
      header: () => (
        <Button variant="ghost">
          Show Tree <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        const memberId = row.getValue("company_member_id") as string;
        return (
          <div className="flex items-center gap-4">
            <ActiveTreeModal teamMemberProfile={memberId} />
          </div>
        );
      },
    },
    {
      accessorKey: "company_withdrawal_request_status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-1"
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
        return <Badge className={`${color} text-white`}>{status}</Badge>;
      },
    },
    {
      accessorKey: "company_withdrawal_request_amount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount <ArrowUpDown />
        </Button>
      ),
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
        <div className="text-center w-xs">
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
        <div className="text-center w-xs">
          {row.getValue("company_withdrawal_request_bank_name")}
        </div>
      ),
    },
    {
      accessorKey: "company_withdrawal_request_withdraw_type",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "desc")}
        >
          Type <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-wrap">
          {row.getValue("company_withdrawal_request_withdraw_type")}
        </div>
      ),
    },
    {
      accessorKey: "company_withdrawal_request_date",

      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date Created <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center w-40">
          {formatDateToYYYYMMDD(
            row.getValue("company_withdrawal_request_date")
          )}
          , {formatTime(row.getValue("company_withdrawal_request_date"))}
        </div>
      ),
    },

    ...(status !== "PENDING"
      ? [
          {
            accessorKey: "company_withdrawal_request_date_updated",
            header: ({ column }: { column: Column<WithdrawalRequestData> }) => (
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
            cell: ({ row }: { row: Row<WithdrawalRequestData> }) => (
              <div className="text-wrap w-40">
                {row.getValue("company_withdrawal_request_date_updated")
                  ? formatDateToYYYYMMDD(
                      row.getValue("company_withdrawal_request_date_updated")
                    ) +
                    " " +
                    formatTime(
                      row.getValue("company_withdrawal_request_date_updated")
                    )
                  : ""}
              </div>
            ),
          },
        ]
      : []),
    ...(role == "ACCOUNTING_HEAD"
      ? [
          {
            accessorKey: "approver_username",
            header: ({ column }: { column: Column<WithdrawalRequestData> }) => (
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
            cell: ({ row }: { row: Row<WithdrawalRequestData> }) => (
              <div className="text-wrap">
                {row.getValue("approver_username")}
              </div>
            ),
          },
        ]
      : []),
    ...(status == "REJECTED"
      ? [
          {
            accessorKey: "company_withdrawal_request_reject_note",
            header: () => <div>Rejection Note</div>,
            cell: ({ row }: { row: Row<WithdrawalRequestData> }) => {
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
        ]
      : []),
    ...(status == "PENDING"
      ? [
          {
            header: "Actions",
            cell: ({ row }: { row: Row<WithdrawalRequestData> }) => {
              const data = row.original;

              return (
                <>
                  {data.company_withdrawal_request_status === "PENDING" && (
                    <div className="flex gap-2">
                      <Button
                        className="bg-green-500 hover:bg-green-600 dark:bg-green-500 dark:text-white "
                        onClick={() =>
                          setIsOpenModal({
                            open: true,
                            requestId: data.company_withdrawal_request_id,
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
                            requestId: data.company_withdrawal_request_id,
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
        ]
      : []),
  ];

  return {
    columns,
    isOpenModal,
    setIsOpenModal,
    handleUpdateStatus,
    isLoading,
  };
};
