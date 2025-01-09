"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { logError } from "@/services/Error/ErrorLogs";
import { getPackageHistory } from "@/services/Package/Member";
import { escapeFormData } from "@/utils/function";
import { createClientSide } from "@/utils/supabase/client";
import { PackageHistoryData } from "@/utils/types";
import { alliance_member_table } from "@prisma/client";
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, RefreshCw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import TableLoading from "../ui/tableLoading";
import { usePackageHistoryColumns } from "./PackageHistoryColumn";

type DataTableProps = {
  teamMemberProfile: alliance_member_table;
};

type FilterFormValues = {
  search: string;
};

const AdminTopUpApprovalTable = ({ teamMemberProfile }: DataTableProps) => {
  const supabaseClient = createClientSide();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [requestData, setRequestData] = useState<PackageHistoryData[]>([]);
  const [requestCount, setRequestCount] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [isFetchingList, setIsFetchingList] = useState(false);

  const columnAccessor =
    sorting?.[0]?.id || "package_member_connection_created";
  const isAscendingSort =
    sorting?.[0]?.desc === undefined ? true : !sorting[0].desc;

  const fetchAdminRequest = async () => {
    try {
      if (!teamMemberProfile) return;
      setIsFetchingList(true);

      const sanitizedData = escapeFormData(getValues());

      const { search } = sanitizedData;

      const { data, totalCount } = await getPackageHistory({
        search,
        page: activePage,
        limit: 10,
        sortBy: isAscendingSort,
        columnAccessor,
        teamMemberId: teamMemberProfile.alliance_member_id,
      });

      setRequestData(data || []);
      setRequestCount(totalCount || 0);
    } catch (e) {
      if (e instanceof Error) {
        await logError(supabaseClient, {
          errorMessage: e.message,
          stackTrace: e.stack,
          stackPath: "components/PackageHistory/PackageHistoryTable.tsx",
        });
      }
    } finally {
      setIsFetchingList(false);
    }
  };

  const { columns } = usePackageHistoryColumns();

  const table = useReactTable({
    data: requestData,
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

  const pageCount = Math.ceil(requestCount / 10);

  const { register, handleSubmit, getValues } = useForm<FilterFormValues>({
    defaultValues: {
      search: "",
    },
  });

  useEffect(() => {
    fetchAdminRequest();
  }, [supabaseClient, teamMemberProfile, activePage, sorting]);

  const handleFilter = async () => {
    await fetchAdminRequest();
  };

  return (
    <ScrollArea className="w-full overflow-x-auto ">
      <Card className="w-full rounded-sm p-4">
        <h1>Package History</h1>
        <div className="flex items-center py-4">
          <form className="flex gap-2" onSubmit={handleSubmit(handleFilter)}>
            <div className="flex gap-2 items-center ">
              <Input
                {...register("search")}
                placeholder="Package name..."
                className="w-full sm:max-w-sm p-2 border rounded"
              />
              <Button
                type="submit"
                disabled={isFetchingList}
                size="sm"
                variant="outline"
                className=" sm:w-auto"
              >
                <Search />
              </Button>
              <Button
                onClick={fetchAdminRequest}
                disabled={isFetchingList}
                size="sm"
                className="w-full sm:w-auto"
              >
                <RefreshCw className="mr-2" />
                Refresh
              </Button>
            </div>
          </form>
        </div>

        {isFetchingList && <TableLoading />}
        <Separator />
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <tfoot>
            <TableRow>
              <TableCell className="px-0" colSpan={columns.length}>
                <div className="flex justify-between items-center border-t px-2 pt-2">
                  <span className="text-sm text-gray-600 dark:text-white">
                    Showing {Math.min(activePage * 10, requestCount)} out of{" "}
                    {requestCount} entries
                  </span>
                </div>
              </TableCell>
            </TableRow>
          </tfoot>
        </Table>
        <ScrollBar orientation="horizontal" />

        <div className="flex items-center justify-end gap-x-4 py-4">
          {activePage > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActivePage((prev) => Math.max(prev - 1, 1))}
              disabled={activePage <= 1}
            >
              <ChevronLeft />
            </Button>
          )}

          <div className="flex space-x-2">
            {(() => {
              const maxVisiblePages = 3;
              const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
              let displayedPages = [];

              if (pageCount <= maxVisiblePages) {
                // Show all pages if there are 3 or fewer
                displayedPages = pages;
              } else {
                if (activePage <= 2) {
                  // Show the first 3 pages and the last page
                  displayedPages = [1, 2, 3, "...", pageCount];
                } else if (activePage >= pageCount - 1) {
                  // Show the first page and the last 3 pages
                  displayedPages = [
                    1,
                    "...",
                    pageCount - 2,
                    pageCount - 1,
                    pageCount,
                  ];
                } else {
                  displayedPages = [
                    activePage - 1,
                    activePage,
                    activePage + 1,
                    "...",
                    pageCount,
                  ];
                }
              }

              return displayedPages.map((page, index) =>
                typeof page === "number" ? (
                  <Button
                    key={page}
                    variant={activePage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActivePage(page)}
                  >
                    {page}
                  </Button>
                ) : (
                  <span key={`ellipsis-${index}`} className="px-2 py-1">
                    {page}
                  </span>
                )
              );
            })()}
          </div>
          {activePage < pageCount && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setActivePage((prev) => Math.min(prev + 1, pageCount))
              }
              disabled={activePage >= pageCount}
            >
              <ChevronRight />
            </Button>
          )}
        </div>
      </Card>
    </ScrollArea>
  );
};

export default AdminTopUpApprovalTable;
