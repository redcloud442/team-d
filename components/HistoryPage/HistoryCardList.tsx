import { formateMonthDateYearv2, formatNumberLocale } from "@/utils/function";
import { company_transaction_table } from "@/utils/types";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

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
            <th className="px-4 py-3 font-bold w-1/4 text-left">Amount</th>
            <th className="px-4 py-3 font-bold w-1/4 text-left">Date</th>
            <th className="px-4 py-3 font-bold w-1/4 text-left">Description</th>
            {currentStatus !== "EARNINGS" && (
              <th className="px-4 py-3 font-bold w-1/4 text-left">Details</th>
            )}
            <th className="px-4 py-3 font-bold w-1/4 text-left">Type</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-blue-700/20 text-white font-medium">
          {data.map((item) => {
            const isFailed =
              item.company_transaction_description.includes("REJECTED");

            return (
              <tr
                key={item.company_transaction_id}
                className="hover:bg-blue-900/30 transition-colors duration-200"
              >
                <td
                  className={`px-4 py-3 font-bold whitespace-nowrap ${
                    isFailed ? "text-red-400" : "text-green-400"
                  }`}
                >
                  ₱ {formatNumberLocale(item.company_transaction_amount ?? 0)}
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {formateMonthDateYearv2(item.company_transaction_date)}
                </td>
                <td className="px-4 py-3 text-gray-300">
                  {item.company_transaction_description}
                </td>
                {currentStatus !== "EARNINGS" && (
                  <td className="px-4 py-3 text-blue-400 text-xs truncate">
                    {item.company_transaction_details
                      ?.split(",")
                      .map((line, idx) => (
                        <p key={idx} className="text-sm text-white">
                          {line.trim()}
                        </p>
                      ))}
                  </td>
                )}
                <td className="px-4 py-3 text-blue-300 uppercase text-xs truncate">
                  {item.company_transaction_type}
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
