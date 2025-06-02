"use client";

import { logError } from "@/services/Error/ErrorLogs";
import { getUserWithActiveBalance } from "@/services/User/Admin";
import { useRole } from "@/utils/context/roleContext";
import { escapeFormData } from "@/utils/function";
import { createClientSide } from "@/utils/supabase/client";
import { user_table } from "@/utils/types";
import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { RefreshCw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import ReusableTable from "../ReusableTable/ReusableTable";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { AdminUserMonitoringColumn } from "./AdminUserMonitoringColumn";

type FilterFormValues = {
  usernameFilter: string;
};

const AdminUserMonitoringTable = () => {
  const supabaseClient = createClientSide();
  const { teamMemberProfile } = useRole();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [requestData, setRequestData] = useState<
    (user_table & { company_member_id: string })[]
  >([]);
  const [requestCount, setRequestCount] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [isFetchingList, setIsFetchingList] = useState(false);

  const columnAccessor = sorting?.[0]?.id || "user_date_created";
  const isAscendingSort =
    sorting?.[0]?.desc === undefined ? true : !sorting[0].desc;

  const fetchAdminRequest = async () => {
    try {
      if (!teamMemberProfile) return;
      setIsFetchingList(true);

      const sanitizedData = escapeFormData(getValues());

      const { usernameFilter } = sanitizedData;

      const { data, totalCount } = await getUserWithActiveBalance({
        teamMemberId: teamMemberProfile.company_member_id,
        page: activePage,
        limit: 10,
        columnAccessor: columnAccessor,
        isAscendingSort: isAscendingSort,
        search: usernameFilter,
      });

      setRequestData(data || []);
      setRequestCount(totalCount || 0);
    } catch (e) {
      if (e instanceof Error) {
        await logError(supabaseClient, {
          errorMessage: e.message,
          stackTrace: e.stack,
          stackPath: "components/AdminUsersPage/AdminUsersTable.tsx",
        });
      }
    } finally {
      setIsFetchingList(false);
    }
  };

  const handleFilter = async () => {
    try {
      await fetchAdminRequest();
    } catch (e) {}
  };

  const columns = AdminUserMonitoringColumn();

  const table = useReactTable({
    data: requestData,
    columns: columns,
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

  const { register, handleSubmit, getValues } = useForm<FilterFormValues>({
    defaultValues: {
      usernameFilter: "",
    },
  });

  useEffect(() => {
    fetchAdminRequest();
  }, [supabaseClient, teamMemberProfile, activePage, sorting]);

  const pageCount = Math.ceil(requestCount / 10);

  return (
    <Card className="w-full rounded-sm p-4">
      <div className="flex flex-wrap items-start py-4">
        <form
          className="flex flex-col gap-6 w-full max-w-3xl"
          onSubmit={handleSubmit(handleFilter)}
        >
          <div className="flex flex-wrap gap-2 items-center">
            <Input
              {...register("usernameFilter")}
              placeholder="Filter username..."
              className="w-full sm:max-w-sm p-2 border rounded"
            />
            <Button
              type="submit"
              disabled={isFetchingList}
              size="sm"
              variant="card"
              className="w-full sm:w-auto"
            >
              <Search />
            </Button>
            <Button
              onClick={fetchAdminRequest}
              disabled={isFetchingList}
              size="sm"
              variant="card"
              className="w-full sm:w-auto"
            >
              <RefreshCw className="mr-2" />
              Refresh
            </Button>
          </div>
        </form>
      </div>

      <ReusableTable
        table={table}
        columns={columns}
        activePage={activePage}
        totalCount={requestCount}
        isFetchingList={isFetchingList}
        setActivePage={setActivePage}
        pageCount={pageCount}
      />
    </Card>
  );
};

export default AdminUserMonitoringTable;
