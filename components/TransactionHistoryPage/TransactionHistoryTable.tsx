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
import { getTransactionHistory } from "@/services/Transaction/Transaction";
import { createClientSide } from "@/utils/supabase/client";
import {
  alliance_member_table,
  alliance_transaction_table,
} from "@prisma/client";
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import TableLoading from "../ui/tableLoading";
import { TransactionHistoryColumn } from "./TransactionHistoryColumn";

type DataTableProps = {
  teamMemberProfile: alliance_member_table;
};

const TransactionHistoryTable = ({ teamMemberProfile }: DataTableProps) => {
  const supabaseClient = createClientSide();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [requestData, setRequestData] = useState<alliance_transaction_table[]>(
    []
  );
  const [requestCount, setRequestCount] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [isFetchingList, setIsFetchingList] = useState(false);

  const fetchRequest = async () => {
    try {
      if (!teamMemberProfile) return;
      setIsFetchingList(true);

      const { transactionHistory, totalTransactions } =
        await getTransactionHistory({
          page: activePage,
          limit: 10,
        });

      setRequestData(transactionHistory || []);
      setRequestCount(totalTransactions || 0);
    } catch (e) {
      if (e instanceof Error) {
        await logError(supabaseClient, {
          errorMessage: e.message,
          stackTrace: e.stack,
          stackPath: "components/TopUpHistoryPage/TopUpHistoryTable.tsx",
        });
      }
    } finally {
      setIsFetchingList(false);
    }
  };

  const columns = TransactionHistoryColumn();

  const table = useReactTable({
    data: requestData,
    columns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  useEffect(() => {
    fetchRequest();
  }, [supabaseClient, teamMemberProfile, activePage]);

  const pageCount = Math.ceil(requestCount / 10);

  return (
    <ScrollArea className="w-full overflow-x-auto ">
      {isFetchingList && <TableLoading />}

      <Table className="w-full border-collapse border border-black font-bold">
        <TableHeader className="border-b border-black dark:text-pageColor font-bold">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-b border-black  dark:text-pageColor font-bold"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  className="border-r border-black px-4 py-2 dark:text-pageColor hover:bg-transparent font-bold"
                  key={header.id}
                >
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
                className="border-none font-bold"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    className="border-r border-black px-4 py-2"
                    key={cell.id}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="border-b border-black">
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center border-r border-black"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <ScrollBar orientation="horizontal" />

      <div className="flex items-center justify-between gap-x-4 py-4">
        {/* <div className="flex justify-between items-center px-2 pt-2">
          <span className="text-sm dark:text-pageColor font-bold ">
            Rows per page
          </span>
          <Select
            defaultValue="10"
            onValueChange={(value) => setLimit(Number(value))}
          >
            <SelectTrigger className="w-[70px] h-8 dark:bg-transparent space-x-2 dark:text-pageColor font-bold border-none border-b-2 shadow-none border-black">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="30">30</SelectItem>
            </SelectContent>
          </Select>
        </div> */}
        <div className="flex items-center justify-start gap-x-4">
          {/* Left Arrow */}
          <Button
            className="shadow-none"
            size="sm"
            onClick={() => setActivePage((prev) => Math.max(prev - 1, 1))}
            disabled={activePage <= 1}
          >
            <ChevronLeft />
          </Button>

          {/* Active Page */}
          <span className="text-lg font-semibold">{activePage}</span>

          {/* Right Arrow */}
          <Button
            className="shadow-none"
            size="sm"
            onClick={() =>
              setActivePage((prev) => Math.min(prev + 1, pageCount))
            }
            disabled={activePage >= pageCount}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
};

export default TransactionHistoryTable;
