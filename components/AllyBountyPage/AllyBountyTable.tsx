"use client";

import { getAllyBounty } from "@/services/Bounty/Member";
import { useRole } from "@/utils/context/roleContext";
import { useInfiniteQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import GenericTableList from "../ReusableCardList/ReusableCardList";
import { AllyBountyColumn } from "./AllyBountyColum";

const PAGE_LIMIT = 10;

const AllyBountyTable = () => {
  const { teamMemberProfile } = useRole();

  const [countdown, setCountdown] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // store interval to clear later

  const columnAccessor = "user_date_created";
  const isAscendingSort = true;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["ally-bounty", teamMemberProfile?.company_member_id],
    queryFn: async ({ pageParam = 1 }) => {
      return await getAllyBounty({
        page: pageParam,
        limit: PAGE_LIMIT,
        columnAccessor,
        isAscendingSort,
        search: "",
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.flatMap((p) => p.data).length;
      if (totalLoaded < (lastPage.totalCount || 0)) {
        return allPages.length + 1;
      }
      return undefined;
    },

    enabled: !!teamMemberProfile,
    staleTime: 1000 * 60 * 2, // Cache is fresh for 2 mins
    gcTime: 1000 * 60 * 2, // Cache is stale for 2 mins
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    initialPageParam: 1,
  });

  const columns = AllyBountyColumn();

  const flatData = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  const handleNextPage = () => {
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
            Referral
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
      <GenericTableList
        data={flatData}
        count={data?.pages[0]?.totalCount || 0}
        isLoading={isLoading || isFetchingNextPage}
        onLoadMore={handleNextPage}
        columns={columns}
        emptyMessage="No data found."
        getRowId={(item) => item.user_id}
      />
    </div>
  );
};

export default AllyBountyTable;
