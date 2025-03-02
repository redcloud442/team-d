import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { logError } from "@/services/Error/ErrorLogs";
import { handleUpdateMerchantData } from "@/services/merchant/Merchant";
import { escapeFormData } from "@/utils/function";
import { createClientSide } from "@/utils/supabase/client";
import { merchant_table } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import TableLoading from "../ui/tableLoading";

export const useMerchantColumn = (handleFetch: () => void) => {
  const { toast } = useToast();
  const supabase = createClientSide();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState({
    merchantId: "",
    isOpen: false,
  });

  const handleUpdateMerchant = async ({
    merchantId,
  }: {
    merchantId: string;
  }) => {
    try {
      setIsLoading(true);
      const sanitizedData = escapeFormData({ merchantId });
      await handleUpdateMerchantData({
        merchantId: sanitizedData.merchantId,
      });

      toast({
        title: "Merchant Deleted",
        description: "Merchant has been deleted successfully",
      });
      setIsDeleteModal({ merchantId: "", isOpen: false });
      handleFetch();
    } catch (e) {
      if (e instanceof Error) {
        await logError(supabase, {
          errorMessage: e.message,
          stackTrace: e.stack,
          stackPath: "components/MerchantPage/MerchantColumn.tsx",
        });
      }
      toast({
        title: "Error",
        description: "An error occurred while creating the merchant.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnDef<merchant_table>[] = [
    {
      accessorKey: "merchant_account_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Account Name <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-wrap">{row.getValue("merchant_account_name")}</div>
      ),
    },
    {
      accessorKey: "merchant_account_number",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Account Number <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        return (
          <div className="font-medium text-wrap">
            {row.getValue("merchant_account_number")}
          </div>
        );
      },
    },
    {
      accessorKey: "merchant_account_type",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Account Type <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-wrap">{row.getValue("merchant_account_type")}</div>
      ),
    },
    {
      accessorKey: "merchant_qr_attachment",
      header: "QR Attachment",
      cell: ({ row }) => {
        const attachmentUrl = row.getValue("merchant_qr_attachment") as string;
        return (
          <>
            {attachmentUrl ? (
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
                      src={attachmentUrl || ""}
                      alt="Attachment Preview"
                      width={200}
                      height={200}
                    />
                  </div>

                  <DialogClose asChild>
                    <Button variant="secondary">Close</Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
            ) : null}
          </>
        );
      },
    },
    {
      header: "Action",
      cell: ({ row }) => {
        const data = row.original;
        return (
          <DropdownMenu>
            <>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() =>
                    setIsDeleteModal({
                      merchantId: data.merchant_id,
                      isOpen: true,
                    })
                  }
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) {
    <TableLoading />;
  }

  return {
    columns,
    isDeleteModal,
    setIsDeleteModal,
    handleUpdateMerchant,
    isLoading,
    setIsLoading,
  };
};
