import {
  colorPicker,
  formateMonthDateYearv2,
  formatNumberLocale,
  formatTime,
} from "@/utils/function";
import { company_transaction_table } from "@/utils/types";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import HistoryReceipt from "./HistoryReceipt";

type Props = {
  data: company_transaction_table[];
  count: number;
  isLoading?: boolean;
  onLoadMore?: () => void;
  currentStatus: string;
};

const HistoryCardList = ({
  data,
  count,
  isLoading = false,
  onLoadMore,
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
    <div className="overflow-x-auto rounded-lg border border-blue-500 shadow-md bg-blue-500/5">
      <table className="min-w-full text-sm table-fixed">
        <thead className="bg-[#0f172a] text-white uppercase text-xs">
          <tr>
            <th className="px-4 py-3 font-bold w-full sm:w-1/3 text-left">
              Date
            </th>
            {["WITHDRAWAL", "DEPOSIT"].includes(currentStatus) && (
              <th className="px-4 py-3 font-bold w-1/4 sm:w-1/3 text-left">
                Receipt
              </th>
            )}
            {["REFERRAL"].includes(currentStatus) && (
              <th className="px-4 py-3 font-bold w-full sm:w-1/3 text-left">
                Username
              </th>
            )}

            <th className="px-4 py-3 font-bold w-full sm:w-1/3 text-left">
              {currentStatus === "REFERRAL" ? "Type" : "Status"}
            </th>
            <th className="px-4 py-3 font-bold w-full sm:w-1/3 text-left">
              Amount
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-blue-700/20 text-white font-medium">
          {data.map((item, index) => {
            return (
              <tr
                key={item.company_transaction_id}
                className="hover:bg-blue-900/30 transition-colors duration-200"
              >
                <td className="px-4 py-3 text-bg-primary-blue">
                  {index + 1}
                  {". "}
                  {formateMonthDateYearv2(item.company_transaction_date)},{" "}
                  {formatTime(item.company_transaction_date)}
                </td>
                {["WITHDRAWAL", "DEPOSIT"].includes(currentStatus) && (
                  <td className="px-4 py-3 text-bg-primary-blue">
                    <HistoryReceipt selectedTransaction={item} />
                  </td>
                )}

                {["REFERRAL"].includes(currentStatus) && (
                  <td className="px-4 py-3">
                    {item.company_transaction_details}
                  </td>
                )}

                <td
                  className={`px-4 py-3 ${colorPicker(
                    item.company_transaction_description
                  )}`}
                >
                  {item.company_transaction_description}
                </td>
                <td
                  className={`px-4 py-3 font-bold whitespace-nowrap text-gray-400`}
                >
                  ₱ {formatNumberLocale(item.company_transaction_amount ?? 0)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {count > data.length && (
        <div className="p-4 text-center">
          <Button
            onClick={onLoadMore}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-full transition"
          >
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default HistoryCardList;
