"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMemberTopUpRequest } from "@/services/TopUp/Member";
import { escapeFormData } from "@/utils/function";
import { createClientSide } from "@/utils/supabase/client";
import { TopUpRequestData } from "@/utils/types";
import { alliance_member_table } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
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
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import TableLoading from "../ui/tableLoading";
import { TopUpHistoryColumn } from "./TopUpHistoryColumn";

type DataTableProps = {
  teamMemberProfile: alliance_member_table;
};

type FilterFormValues = {
  referenceId: string;
};

const TopUpHistoryTable = ({ teamMemberProfile }: DataTableProps) => {
  const supabaseClient = createClientSide();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [requestData, setRequestData] = useState<TopUpRequestData[]>([]);
  const [requestCount, setRequestCount] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [isFetchingList, setIsFetchingList] = useState(false);

  const columnAccessor = sorting?.[0]?.id || "alliance_top_up_request_date";
  const isAscendingSort =
    sorting?.[0]?.desc === undefined ? true : !sorting[0].desc;

  const fetchRequest = async () => {
    try {
      if (!teamMemberProfile) return;
      setIsFetchingList(true);

      const sanitizedData = escapeFormData(getValues());

      const { referenceId } = sanitizedData;

      const { data, totalCount } = await getMemberTopUpRequest(supabaseClient, {
        teamId: teamMemberProfile.alliance_member_alliance_id,
        teamMemberId: teamMemberProfile.alliance_member_id,
        page: activePage,
        limit: 10,
        columnAccessor: columnAccessor,
        isAscendingSort: isAscendingSort,
        search: referenceId,
      });

      setRequestData(data || []);
      setRequestCount(totalCount || 0);
    } catch (e) {
    } finally {
      setIsFetchingList(false);
    }
  };

  const handleFilter = async () => {
    try {
      await fetchRequest();
    } catch (e) {}
  };

  const columns = TopUpHistoryColumn();

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

  const { register, handleSubmit, getValues } = useForm<FilterFormValues>({
    defaultValues: {
      referenceId: "",
    },
  });

  useEffect(() => {
    fetchRequest();
  }, [supabaseClient, teamMemberProfile, activePage, sorting]);

  const pageCount = Math.ceil(requestCount / 13);

  return (
    <Card className="w-full rounded-sm p-4">
      <h1>Top Up List</h1>
      <div className="flex items-center py-4">
        <form className="flex gap-2" onSubmit={handleSubmit(handleFilter)}>
          <Input
            {...register("referenceId")}
            placeholder="Filter reference id..."
            className="max-w-sm p-2 border rounded"
          />
          <Button
            type="submit"
            disabled={isFetchingList}
            size="sm"
            variant="outline"
          >
            <Search />
          </Button>
          <Button onClick={fetchRequest} disabled={isFetchingList} size="sm">
            <RefreshCw />
            Refresh
          </Button>
        </form>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-100 z-50 border border-gray-300 rounded-lg shadow-lg">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="flex cursor-pointer items-center justify-between px-6 py-2 hover:bg-gray-200 transition-colors duration-200 rounded-md"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  <span>
                    {typeof column.columnDef.header === "function"
                      ? column.columnDef.label
                      : column.columnDef.label}
                  </span>

                  {column.getIsVisible() && <Check className="w-4 h-4" />}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        {isFetchingList && <TableLoading />}
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
        </Table>
      </div>
      <Separator />
      <div className="flex items-center justify-between py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActivePage((prev) => Math.max(prev - 1, 1))}
          disabled={activePage <= 1}
        >
          <ChevronLeft />
        </Button>
        <div className="flex space-x-2">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={activePage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setActivePage(page)}
            >
              {page}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActivePage((prev) => Math.min(prev + 1, pageCount))}
          disabled={activePage >= pageCount}
        >
          <ChevronRight />
        </Button>
      </div>
    </Card>
  );
};

export default TopUpHistoryTable;
