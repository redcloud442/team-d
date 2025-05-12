import { formateMonthDateYearv2, formatNumberLocale } from "@/utils/function";
import { company_transaction_table } from "@prisma/client";
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
    <div className="overflow-x-auto rounded-lg border-2 border-orange-500 shadow-md bg-orange-500/10">
      <table className="min-w-full text-sm table-fixed">
        <thead className="bg-[#1a1a1a] text-white uppercase text-xs">
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
        <tbody className="divide-y divide-[#2b2b2b] text-white font-medium">
          {data.map((item) => {
            const isFailed =
              item.company_transaction_description.includes("FAILED");

            return (
              <tr
                key={item.company_transaction_id}
                className="hover:bg-[#1f1f1f] transition-colors"
              >
                <td
                  className={`px-4 py-3 font-bold ${
                    isFailed ? "text-red-400" : "text-green-400"
                  } whitespace-nowrap`}
                >
                  ₱ {formatNumberLocale(item.company_transaction_amount ?? 0)}
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {formateMonthDateYearv2(item.company_transaction_date)}
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {item.company_transaction_description}
                </td>
                {currentStatus !== "EARNINGS" && (
                  <td className="px-4 py-3 text-orange-500 text-xs truncate">
                    {item.company_transaction_details
                      ?.split(",")
                      .map((line, idx) => (
                        <p key={idx} className="text-sm text-white">
                          {line.trim()}
                        </p>
                      ))}
                  </td>
                )}
                <td className="px-4 py-3 text-orange-500 uppercase text-xs truncate">
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
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2 rounded-full"
          >
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default HistoryCardList;
