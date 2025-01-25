import { formateMonthDateYear } from "@/utils/function";
import { alliance_transaction_table } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export const TransactionHistoryColumn =
  (): ColumnDef<alliance_transaction_table>[] => {
    return [
      {
        accessorKey: "transaction_date",
        header: () => (
          <div className="text-center  text-lg  font-bold">Date</div>
        ),
        cell: ({ row }) => {
          return (
            <div className="text-center">
              {formateMonthDateYear(row.getValue("transaction_date"))}
            </div>
          );
        },
      },

      {
        accessorKey: "transaction_description",
        header: () => (
          <div className="text-center  text-lg  font-bold">Category</div>
        ),
        cell: ({ row }) => {
          const details = row.original.transaction_details as string;
          const description = row.getValue("transaction_description") as string;
          return (
            <div className="flex items-center justify-center">
              <Popover>
                <PopoverTrigger>
                  {description}{" "}
                  {description.includes("Deposit") && (
                    <div className="flex items-center justify-center gap-2 text-primaryYellow">
                      <Info className="w-4 h-4 " />
                      <p>Details</p>
                    </div>
                  )}
                  {description.includes("Withdrawal") && (
                    <div className="flex items-center justify-center gap-2 text-primaryYellow">
                      <Info className="w-4 h-4 " />
                      
                      <p>Details</p>
                    </div>
                  )}
                </PopoverTrigger>
                <PopoverContent>
                  <p>{details}</p>
                </PopoverContent>
              </Popover>
            </div>
          );
        },
      },
      {
        accessorKey: "transaction_amount",
        header: () => (
          <div className="text-center text-lg font-bold">Amount</div>
        ),
        cell: ({ row }) => (
          <div className="text-center">
            ₱{" "}
            {Number(row.getValue("transaction_amount")).toLocaleString(
              "en-US",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}
          </div>
        ),
      },
    ];
  };
