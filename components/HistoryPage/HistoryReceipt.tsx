import {
  colorPicker,
  formatDateToYYYYMMDD,
  formateMonthDateYearv2,
  formatNumberLocale,
} from "@/utils/function";
import { company_transaction_table } from "@/utils/types";
import Image from "next/image";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";

type Props = {
  selectedTransaction: company_transaction_table | null;
};

const HistoryReceipt = ({ selectedTransaction }: Props) => {
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View
        </Button>
      </DialogTrigger>

      <DialogContent type="earnings" className="max-w-md">
        <ScrollArea className="h-[80vh] sm:h-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-white">
              Transaction Receipt
            </DialogTitle>
          </DialogHeader>

          {selectedTransaction ? (
            <div className="space-y-6 p-4 rounded-lg border border-gray-200 shadow-sm text-white">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="text-lg font-semibold text-white">
                  {selectedTransaction.company_transaction_type}
                </div>
                <div className="text-3xl font-bold text-primary mt-2">
                  ₱{" "}
                  {formatNumberLocale(
                    selectedTransaction.company_transaction_amount ?? 0
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {formatDateToYYYYMMDD(
                    selectedTransaction.company_transaction_date
                  )}
                </div>
              </div>

              {/* Transaction Details */}
              <div className="space-y-4">
                {selectedTransaction.company_transaction_note && (
                  <div className="p-3 rounded">
                    <div className="text-xs font-medium">Note</div>
                    <div className="text-sm text-white mt-1">
                      {selectedTransaction.company_transaction_note}
                    </div>
                  </div>
                )}

                <div className="border-t border-b border-gray-200 py-4">
                  <div className="text-xs font-medium text-white mb-2">
                    Transaction Details
                  </div>
                  {selectedTransaction.company_transaction_details
                    ?.split(",")
                    .map((line, idx) => (
                      <div key={idx} className="flex justify-between py-1">
                        <span className="text-sm text-white">
                          {line.trim().split(":")[0]}:
                        </span>
                        <span className="text-sm font-medium text-white">
                          {line.trim().split(":")[1]?.trim()}
                        </span>
                      </div>
                    ))}
                  {selectedTransaction.company_transaction_description && (
                    <div className="flex justify-between">
                      <div className="text-sm text-white">Status:</div>
                      <div
                        className={`text-sm  ${colorPicker(
                          selectedTransaction.company_transaction_description
                        )}`}
                      >
                        {selectedTransaction.company_transaction_description}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-medium text-white">
                      Transaction Type
                    </div>
                    <div className="text-sm font-medium text-white mt-1">
                      {selectedTransaction.company_transaction_type}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white">Date</div>
                    <div className="text-sm font-medium text-white mt-1">
                      {formateMonthDateYearv2(
                        selectedTransaction.company_transaction_date
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Attachment */}
              {selectedTransaction.company_transaction_attachment && (
                <div className="mt-6">
                  <div className="text-xs font-medium text-white mb-2">
                    Attachment
                  </div>
                  <Image
                    src={selectedTransaction.company_transaction_attachment}
                    alt="Receipt Attachment"
                    width={400}
                    height={300}
                    className="w-full h-auto object-contain border rounded-lg"
                  />
                </div>
              )}

              {/* Footer */}
              <div className="text-center text-xs text-white mt-6">
                Thank you for your transaction
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-gray-500">No transaction selected.</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default HistoryReceipt;
