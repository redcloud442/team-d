import { formatDateToYYYYMMDD } from "@/utils/function";
import { alliance_transaction_table } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

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
              {formatDateToYYYYMMDD(row.getValue("transaction_date"))}
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
          const description = row.getValue("transaction_description") as string;
          return <div className=" text-center">{description}</div>;
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
