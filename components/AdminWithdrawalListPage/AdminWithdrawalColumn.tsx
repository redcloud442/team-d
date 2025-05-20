import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateWithdrawalStatus } from "@/services/Withdrawal/Admin";
import { formatDateToYYYYMMDD, formatTime } from "@/utils/function";
import {
  AdminWithdrawaldata,
  WithdrawalRequestData,
  user_table,
} from "@/utils/types";
import { Column, ColumnDef, Row } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
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
import AdminWithdrawalModal from "./AdminWithdrawalModal";

const statusColorMap: Record<string, string> = {
  APPROVED: "bg-green-500 dark:bg-green-600 dark:text-white",
  PENDING: "bg-yellow-600 dark:bg-yellow-700 dark:text-white",
  REJECTED: "bg-red-600 dark:bg-red-700 dark:text-white",
};

export const AdminWithdrawalHistoryColumn = (
  profile: user_table,
  setRequestData: Dispatch<SetStateAction<AdminWithdrawaldata | null>>,
  reset: () => void,
  status: "PENDING" | "APPROVED" | "REJECTED",
  hidden: boolean
) => {
  const { toast } = useToast();
  const router = useRouter();
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
                      alliance_withdrawal_request_status: status,
                      approver_username: profile.user_username,
                      alliance_withdrawal_request_date_updated: new Date(),
                    },
                    ...currentStatusData.data,
                  ]
                : [],
              count: Number(currentStatusData?.count || 0) + 1,
            },
          },
        };
      });

      reset();
      setIsOpenModal({ open: false, requestId: "", status: "" });
      toast({
        title: `Status Update`,
        description: `${status} Request Successfully`,
      });
    } catch (e) {
      toast({
        title: `Status Failed`,
        description: `Something went wrong`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnDef<WithdrawalRequestData>[] = [
    {
      accessorKey: "user_username",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "desc")}
        >
          Requestor Name <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="w-full ">
          <div className="flex justify-between items-center gap-2">
            <p
              onClick={() =>
                router.push(`/admin/users/${row.original.user_id}`)
              }
              className="text-wrap cursor-pointer hover:underline text-blue-500"
            >
              {row.getValue("user_username")}
            </p>
            <AdminWithdrawalModal
              setRequestData={setRequestData}
              hiddenUser={hidden}
              status={status}
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
          onClick={() => column.toggleSorting(column.getIsSorted() === "desc")}
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
            <Badge className={`${color}`}>{status}</Badge>
          </div>
        );
      },
    },

    {
      accessorKey: "company_withdrawal_request_amount",
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
          row.getValue("company_withdrawal_request_amount")
        );
        const fee = row.original.company_withdrawal_request_fee;

        const formatted = new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(amount - fee);
        return <div className="font-medium text-wrap">{formatted}</div>;
      },
    },
    {
      accessorKey: "company_withdrawal_request_type",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-1 text-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "desc")}
        >
          Bank Account <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-wrap">
          {row.getValue("company_withdrawal_request_type")}
        </div>
      ),
    },
    {
      accessorKey: "company_withdrawal_request_bank_name",
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
        <div className="text-wrap w-xs">
          {row.getValue("company_withdrawal_request_bank_name")}
        </div>
      ),
    },
    {
      accessorKey: "company_withdrawal_request_account",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "desc")}
        >
          Bank Account <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-wrap">
          {row.getValue("company_withdrawal_request_account")}
        </div>
      ),
    },

    {
      accessorKey: "company_withdrawal_request_date",
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
        <div className="text-wrap w-40">
          {formatDateToYYYYMMDD(
            row.getValue("company_withdrawal_request_date")
          )}
          , {formatTime(row.getValue("company_withdrawal_request_date"))}
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
      accessorKey: "approver_username",
      header: ({ column }: { column: Column<WithdrawalRequestData> }) => (
        <Button
          variant="ghost"
          className="p-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "desc")}
        >
          Approver <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }: { row: Row<WithdrawalRequestData> }) => (
        <div className="text-wrap">{row.getValue("approver_username")}</div>
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
