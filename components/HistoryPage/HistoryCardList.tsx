import { packageMapImage } from "@/utils/constant";
import {
  colorPicker,
  formateMonthDateYearv2,
  formatNumberLocale,
  formatTime,
} from "@/utils/function";
import { company_transaction_table } from "@/utils/types";
import { Triangle } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";
import ReceiptViewer from "./ReceiptViewer";

type Props = {
  data: company_transaction_table[];
  activePage: number;
  handleSpecificPage: (page: number) => void;
  handleNextPage: () => void;
  handlePreviousPage: () => void;
  pageCount: number;
  isLoading?: boolean;
  currentStatus: string;
};

const HistoryCardList = ({
  data,
  activePage,
  handleSpecificPage,
  handleNextPage,
  handlePreviousPage,
  pageCount,
  isLoading = false,
  currentStatus,
}: Props) => {
  if (isLoading && data.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-md" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return <p className="text-center text-gray-500">No transactions found.</p>;
  }

  return (
    <>
      <div className="rounded-lg border border-bg-primary-blue shadow-md p-4 space-y-4">
        <ScrollArea className="h-[600px] space-y-4">
          {data.map((item) => {
            return (
              <div
                key={item.company_transaction_id}
                className="hover:bg-blue-900/30 transition-colors duration-200 border-2 my-4 border-bg-primary-blue rounded-md flex flex-col md:flex-row justify-start items-center p-4"
              >
                <div>
                  <div
                    className={`px-4 py-3 text-3xl font-black text-white uppercase `}
                  >
                    {currentStatus === "REFERRAL" ? (
                      item.company_transaction_description
                    ) : currentStatus === "EARNINGS" ? (
                      <>
                        <Image
                          src={
                            packageMapImage[
                              item.company_transaction_description.includes(
                                "PREMIUM"
                              )
                                ? "PREMIUM"
                                : item.company_transaction_description.includes(
                                      "EXPRESS"
                                    )
                                  ? "EXPRESS"
                                  : item.company_transaction_description.includes(
                                        "VIP"
                                      )
                                    ? "VIP"
                                    : "STANDARD"
                            ]
                          }
                          alt="earnings"
                          width={100}
                          height={100}
                          className="rounded-md"
                        />
                      </>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div>{item.company_transaction_type}</div>
                        {currentStatus === "WITHDRAWAL" &&
                          item.company_transaction_attachment && (
                            <div className="flex items-center justify-center">
                              <ReceiptViewer
                                receipt={item.company_transaction_attachment}
                              />
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-center justify-center flex-1">
                  {/* {["WITHDRAWAL", "DEPOSIT"].includes(currentStatus) && (
                    <div className="px-4 py-3 text-bg-primary-blue">
                      <HistoryReceipt selectedTransaction={item} />
                    </div>
                  )} */}

                  {["WITHDRAWAL", "DEPOSIT"].includes(currentStatus) ? (
                    <div
                      className={`px-4 text-2xl font-bold ${colorPicker(
                        item.company_transaction_description
                      )}`}
                    >
                      {item.company_transaction_description}
                    </div>
                  ) : currentStatus === "EARNINGS" ? (
                    <div
                      className={`px-4 text-2xl font-bold ${colorPicker(
                        item.company_transaction_description
                      )}`}
                    >
                      {item.company_transaction_description.includes(
                        "Subscription"
                      )
                        ? "Subscribed"
                        : "Collected"}
                    </div>
                  ) : (
                    <div className="px-4 text-2xl font-bold text-green-500">
                      PAID
                    </div>
                  )}

                  <div className={`px-4 whitespace-nowrap text-white`}>
                    ₱ {formatNumberLocale(item.company_transaction_amount ?? 0)}
                  </div>
                  <div className="px-4 text-xs text-gray-400">
                    {formateMonthDateYearv2(item.company_transaction_date)},{" "}
                    {formatTime(item.company_transaction_date)}
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </div>

      <div className="flex items-center justify-center gap-x-4 py-4">
        {activePage > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePreviousPage()}
            className="bg-bg-primary text-white hover:bg-bg-primary transition-all duration-200 rounded-lg "
          >
            <Triangle
              className="h-4 w-4 rotate-270"
              strokeWidth={2}
              color="white"
              fill="white"
            />
          </Button>
        )}

        <div className="flex space-x-2">
          {(() => {
            const maxVisiblePages = 3;
            const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
            let displayedPages = [];

            if (pageCount <= maxVisiblePages) {
              displayedPages = pages;
            } else {
              if (activePage <= 2) {
                displayedPages = [1, 2, 3, "...", pageCount];
              } else if (activePage >= pageCount - 1) {
                displayedPages = [
                  1,
                  "...",
                  pageCount - 2,
                  pageCount - 1,
                  pageCount,
                ];
              } else {
                displayedPages = [
                  activePage - 1,
                  activePage,
                  activePage + 1,
                  "...",
                  pageCount,
                ];
              }
            }

            return displayedPages.map((page, index) =>
              typeof page === "number" ? (
                <Button
                  key={page}
                  onClick={() => handleSpecificPage(page)}
                  size="sm"
                  className={`${
                    activePage === page
                      ? "bg-bg-primary-blue text-zinc-900 font-bold shadow-md"
                      : "border bg-bg-primary border-zinc-700 text-zinc-300 hover:bg-bg-primary hover:text-white"
                  } rounded-lg px-3 py-2 transition-all duration-200`}
                >
                  {page}
                </Button>
              ) : (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-1 text-zinc-600 dark:text-zinc-400 bg-bg-primary"
                >
                  {page}
                </span>
              )
            );
          })()}
        </div>

        {activePage < pageCount && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNextPage()}
            className="bg-bg-primary text-white hover:bg-bg-primary-blue transition-all duration-200 rounded-lg "
          >
            <Triangle
              className="h-4 w-4 rotate-90"
              strokeWidth={2}
              color="white"
              fill="white"
            />
          </Button>
        )}
      </div>
    </>
  );
};

export default HistoryCardList;
