"use client";

import { getAllyBounty } from "@/services/Bounty/Member";
import { useDirectReferralStore } from "@/store/useDirectReferralStore";
import { useRole } from "@/utils/context/roleContext";
import { escapeFormData } from "@/utils/function";
import { user_table } from "@prisma/client";
import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import ReusableTable from "../ReusableTable/ReusableTable";
import { AllyBountyColumn } from "./AllyBountyColum";

type FilterFormValues = {
  emailFilter: string;
};

const AllyBountyTable = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [activePage, setActivePage] = useState(1);
  const [isFetchingList, setIsFetchingList] = useState(false);

  const { teamMemberProfile } = useRole();
  const { directReferral, setDirectReferral } = useDirectReferralStore();

  const columnAccessor = sorting?.[0]?.id || "user_date_created";
  const isAscendingSort =
    sorting?.[0]?.desc === undefined ? true : !sorting[0].desc;

  const fetchAdminRequest = async () => {
    try {
      if (!teamMemberProfile) return;

      const now = Date.now();
      const SIXTY_SECONDS = 60 * 1000;

      // Skip if data was fetched less than 60 seconds ago
      if (
        directReferral.lastFetchedAt &&
        now - directReferral.lastFetchedAt < SIXTY_SECONDS
      ) {
        return;
      }

      setIsFetchingList(true);

      const sanitizedData = escapeFormData(getValues());

      const { emailFilter } = sanitizedData;

      const { data, totalCount } = await getAllyBounty({
        page: activePage,
        limit: 10,
        columnAccessor: columnAccessor,
        isAscendingSort: isAscendingSort,
        search: emailFilter,
      });

      setDirectReferral({
        data: data as unknown as (user_table & {
          total_bounty_earnings: string;
          package_ally_bounty_log_date_created: Date;
          company_referral_date: Date;
        })[],
        count: totalCount || 0,
      });
    } catch (e) {
    } finally {
      setIsFetchingList(false);
    }
  };

  const columns = AllyBountyColumn();

  const table = useReactTable({
    data: directReferral.data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const { getValues } = useForm<FilterFormValues>({
    defaultValues: {
      emailFilter: "",
    },
  });

  useEffect(() => {
    fetchAdminRequest();
  }, [teamMemberProfile, activePage, sorting]);

  const pageCount = Math.ceil(directReferral.count / 10);

  return (
    <ReusableTable
      table={table}
      columns={columns}
      activePage={activePage}
      totalCount={directReferral.count}
      isFetchingList={isFetchingList}
      setActivePage={setActivePage}
      pageCount={pageCount}
    />
  );
};

export default AllyBountyTable;
