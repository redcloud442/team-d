"use client";

import { getAllyBounty } from "@/services/Bounty/Member";
import { useRole } from "@/utils/context/roleContext";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import GenericTableList from "../ReusableCardList/ReusableCardList";
import { AllyBountyColumn } from "./AllyBountyColum";

const PAGE_LIMIT = 10;

const AllyBountyTable = () => {
  const { teamMemberProfile } = useRole();

  const columnAccessor = "user_date_created";
  const isAscendingSort = true;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
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

  return (
    <GenericTableList
      data={flatData}
      count={data?.pages[0]?.totalCount || 0}
      isLoading={isLoading || isFetchingNextPage}
      onLoadMore={handleNextPage}
      columns={columns}
      emptyMessage="No data found."
      getRowId={(item) => item.user_id}
    />
  );
};

export default AllyBountyTable;
