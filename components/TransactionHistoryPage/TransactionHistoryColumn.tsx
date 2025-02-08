import { formatDateToYYYYMMDD, formatTime } from "@/utils/function";
import { alliance_transaction_table } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { Info, Receipt } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
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
              {formatDateToYYYYMMDD(row.getValue("transaction_date"))},{" "}
              {formatTime(row.getValue("transaction_date"))}
            </div>
          );
        },
      },
      {
        accessorKey: "transaction_description",
        header: () => (
          <div className="text-wrap text-lg font-bold">Category</div>
        ),
        cell: ({ row }) => {
          const details = row.original.transaction_details as string;
          const description = row.getValue("transaction_description") as string;
          const attachment = row.original.transaction_attachment as string;

          return (
            <div className="flex flex-col sm:flex-row justify-start items-center gap-4">
              <span>{description}</span>
              {description.includes("Deposit") && (
                <div className="flex items-center text-sm gap-2 text-yellow-700">
                  <Info className="w-4 h-4" />
                  <Popover>
                    <PopoverTrigger>
                      <p>Details</p>
                    </PopoverTrigger>
                    <PopoverContent>
                      {details && (
                        <>
                          <p>
                            {/** Split the details if it follows a specific pattern **/}
                            <strong>Account Name: </strong>
                            {details
                              .split(",")[0]
                              ?.replace("Account Name: ", "")}
                          </p>
                          <p>
                            <strong>Account Number: </strong>
                            {details
                              .split(",")[1]
                              ?.replace("Account Number: ", "")
                              .trim()}
                          </p>
                        </>
                      )}
                    </PopoverContent>
                  </Popover>
                  {attachment && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="icon" variant="destructive">
                          <Receipt className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>

                      <DialogContent type="table">
                        <DialogHeader>
                          <DialogTitle>Attachment</DialogTitle>
                        </DialogHeader>
                        <div className="flex justify-center items-center">
                          <Image
                            src={attachment || ""}
                            alt="Attachment Preview"
                            width={250}
                            height={250}
                          />
                        </div>
                        <DialogClose asChild>
                          <Button variant="secondary">Close</Button>
                        </DialogClose>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              )}
              {description.includes("Withdrawal") && (
                <div className="flex items-center gap-2 text-sm text-yellow-700">
                  <Info className="w-4 h-4" />
                  <Popover>
                    <PopoverTrigger>
                      <p>Details</p>
                    </PopoverTrigger>
                    <PopoverContent>
                      {details && (
                        <>
                          <p>
                            {/** Split the details if it follows a specific pattern **/}
                            <strong>Account Name: </strong>
                            {details
                              .split(",")[0]
                              ?.replace("Account Name: ", "")}
                          </p>
                          <p>
                            <strong>Account Number: </strong>
                            {details
                              .split(",")[1]
                              ?.replace("Account Number: ", "")
                              .trim()}
                          </p>
                        </>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
              )}
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
