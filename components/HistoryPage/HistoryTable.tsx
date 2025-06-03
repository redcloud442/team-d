"use client";

import { getTransactionHistory } from "@/services/Transaction/Transaction";
import { useRole } from "@/utils/context/roleContext";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import HistoryCardList from "./HistoryCardList";

type Props = {
  type: "withdrawal" | "deposit" | "earnings" | "referral";
};

const PAGE_LIMIT = 10;

const HistoryTable = ({ type }: Props) => {
  const { teamMemberProfile } = useRole();

  const statusKey = type.toUpperCase() as
    | "EARNINGS"
    | "WITHDRAWAL"
    | "DEPOSIT"
    | "REFERRAL";

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
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
      staleTime: 1000 * 60 * 2, // Cache is fresh for 2 mins
      gcTime: 1000 * 60 * 2, // Cache is stale for 2 mins
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

  return (
    <HistoryCardList
      data={flatData}
      count={totalCount}
      isLoading={isLoading || isFetchingNextPage}
      onLoadMore={handleLoadMore}
      currentStatus={statusKey}
    />
  );
};

export default HistoryTable;
