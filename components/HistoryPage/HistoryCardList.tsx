import { company_transaction_table } from "@/utils/types";
import {
  Calendar,
  ChevronDown,
  DollarSign,
  TrendingDown,
  TrendingUp,
  User,
  Users,
} from "lucide-react";

// Utility functions
const formatDate = (dateString: Date) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const formatTime = (dateString: Date) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
};

const getStatusColor = (description: string) => {
  const colors = {
    Completed: "text-lime-400",
    Approved: "text-lime-400",
    Verified: "text-lime-400",
    Success: "text-lime-400",
    Bonus: "text-lime-400",
    Commission: "text-lime-400",
    Reward: "text-lime-400",
    Pending: "text-yellow-400",
    Processing: "text-yellow-400",
    "In Progress": "text-yellow-400",
    Rejected: "text-red-400",
    Failed: "text-red-400",
    Cancelled: "text-red-400",
  };
  return colors[description as keyof typeof colors] || "text-gray-400";
};

const getStatusIcon = (status: string) => {
  const icons = {
    WITHDRAWAL: <TrendingDown className="w-4 h-4 text-red-400" />,
    DEPOSIT: <TrendingUp className="w-4 h-4 text-lime-400" />,
    REFERRAL: <Users className="w-4 h-4 text-blue-400" />,
  };
  return (
    icons[status as keyof typeof icons] || <DollarSign className="w-4 h-4" />
  );
};

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="space-y-4 p-6">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="bg-gray-700/50 h-16 rounded-lg"></div>
      </div>
    ))}
  </div>
);

// Main component
const LimeTransactionTable = ({
  data = [],
  count = 0,
  isLoading = false,
  onLoadMore,
  currentStatus = "ALL",
}: {
  data: company_transaction_table[];
  count: number;
  isLoading: boolean;
  onLoadMore: () => void;
  currentStatus: string;
}) => {
  // Loading state when no data
  if (isLoading && data.length === 0) {
    return <LoadingSkeleton />;
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="text-center py-16 bg-neutral-900-800/30 backdrop-blur-sm rounded-2xl border border-lime-400/20">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-800/50 flex items-center justify-center">
          <DollarSign className="w-12 h-12 text-gray-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-400 mb-2">
          No Transactions Found
        </h3>
        <p className="text-gray-500">
          No transactions match your current criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900/30 backdrop-blur-sm rounded-2xl border border-lime-400/20 overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead className="bg-gradient-to-r from-neutral-900 to-neutral-800 border-b border-lime-400/20">
            <tr>
              <th className="px-6 py-4 text-left w-1/4">
                <div className="flex items-center gap-2 text-lime-400 font-bold uppercase tracking-wider text-sm">
                  <Calendar className="w-4 h-4" />
                  Date
                </div>
              </th>

              {currentStatus === "REFERRAL" && (
                <th className="px-6 py-4 text-left w-1/4">
                  <div className="flex items-center gap-2 text-lime-400 font-bold uppercase tracking-wider text-sm">
                    <User className="w-4 h-4" />
                    Username
                  </div>
                </th>
              )}

              <th className="px-6 py-4 text-left w-1/4">
                <div className="flex items-center gap-2 text-lime-400 font-bold uppercase tracking-wider text-sm">
                  {currentStatus === "REFERRAL" ? "Type" : "Status"}
                </div>
              </th>

              <th className="px-6 py-4 text-right w-1/4">
                <div className="flex items-center justify-end gap-2 text-lime-400 font-bold uppercase tracking-wider text-sm">
                  <DollarSign className="w-4 h-4" />
                  Amount
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700/50">
            {data.map((item, index) => (
              <tr
                key={item.company_transaction_id}
                className="hover:bg-lime-400/5 transition-all duration-300 group"
              >
                <td className="px-6 py-4 w-1/4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-white font-medium">
                      <span className="text-lime-400 font-bold text-sm">
                        #{index + 1}
                      </span>
                      {formatDate(item?.company_transaction_date)}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {formatTime(item?.company_transaction_date)}
                    </div>
                  </div>
                </td>

                {currentStatus === "REFERRAL" && (
                  <td className="px-6 py-4 w-1/4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-medium">
                        {item.company_transaction_details}
                      </span>
                    </div>
                  </td>
                )}

                <td className="px-6 py-4 w-1/4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(currentStatus)}
                    <div
                      className={`font-semibold ${getStatusColor(item.company_transaction_description)}`}
                    >
                      {item.company_transaction_description}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 text-right w-1/4">
                  <div className="text-xl font-bold text-gray-300">
                    {formatAmount(item.company_transaction_amount ?? 0)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Load More Button */}
      {count > data.length && onLoadMore && (
        <div className="p-6 text-center border-t border-gray-700/50 bg-gray-800/20">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-lime-400 to-green-400 hover:from-lime-500 hover:to-green-500 text-gray-900 font-bold rounded-xl transition-all duration-300 shadow-lg shadow-lime-400/25 hover:shadow-lime-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Load More
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default LimeTransactionTable;
