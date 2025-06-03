"use client";

import { getTransactionHistory } from "@/services/Transaction/Transaction";
import { useRole } from "@/utils/context/roleContext";
import { useInfiniteQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import HistoryCardList from "./HistoryCardList";

type Props = {
  type: "withdrawal" | "deposit" | "earnings" | "referral";
};

const PAGE_LIMIT = 10;

const HistoryTable = ({ type }: Props) => {
  const { teamMemberProfile } = useRole();
  const [countdown, setCountdown] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // store interval to clear later

  const statusKey = type.toUpperCase() as
    | "EARNINGS"
    | "WITHDRAWAL"
    | "DEPOSIT"
    | "REFERRAL";

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: [
      "transaction-history",
      statusKey,
      teamMemberProfile?.company_member_id,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await getTransactionHistory({
        page: pageParam,
        status: statusKey,
        limit: PAGE_LIMIT,
      });
      return {
        page: pageParam,
        transactions: result.transactionHistory,
        total: result.totalTransactions,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.flatMap((p) => p.transactions).length;
      return totalLoaded < (lastPage.total || 0)
        ? allPages.length + 1
        : undefined;
    },
    enabled: !!teamMemberProfile,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    initialPageParam: 1,
  });

  const flatData = useMemo(() => {
    return data?.pages.flatMap((page) => page.transactions) || [];
  }, [data]);

  const totalCount = data?.pages[0]?.total || 0;

  const handleLoadMore = async () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const handleRefresh = () => {
    refetch();
    setCountdown(30);

    // Clear previous interval if exists
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start new countdown
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <header className="mb-4">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            {type.charAt(0).toUpperCase() + type.slice(1)} Transactions
          </h1>
        </header>
        <button
          onClick={handleRefresh}
          disabled={isLoading || countdown > 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Refresh {countdown > 0 ? `(${countdown}s)` : ""}
        </button>
      </div>

      <HistoryCardList
        data={flatData}
        count={totalCount}
        isLoading={isLoading || isFetchingNextPage || isFetching}
        onLoadMore={handleLoadMore}
        currentStatus={statusKey}
      />
    </div>
  );
};

export default HistoryTable;
