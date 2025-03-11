"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllyBounty } from "@/services/Bounty/Member";
import { useDirectReferralStore } from "@/store/useDirectReferralStore";
import { escapeFormData } from "@/utils/function";
import { createClientSide } from "@/utils/supabase/client";
import { alliance_member_table, user_table } from "@prisma/client";
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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import TableLoading from "../ui/tableLoading";
import { AllyBountyColumn } from "./AllyBountyColum";

type DataTableProps = {
  teamMemberProfile: alliance_member_table;
  sponsor?: string;
};

type FilterFormValues = {
  emailFilter: string;
};

const AllyBountyTable = ({ teamMemberProfile }: DataTableProps) => {
  const supabaseClient = createClientSide();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [activePage, setActivePage] = useState(1);
  const [isFetchingList, setIsFetchingList] = useState(false);

  const { directReferral, setDirectReferral } = useDirectReferralStore();
  const columnAccessor = sorting?.[0]?.id || "user_date_created";
  const isAscendingSort =
    sorting?.[0]?.desc === undefined ? true : !sorting[0].desc;

  const fetchAdminRequest = async () => {
    try {
      if (!teamMemberProfile) return;
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
          alliance_referral_date: Date;
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
    <ScrollArea className="w-full overflow-x-auto ">
      {isFetchingList && <TableLoading />}

      <Table className="w-full border-collapse border border-black font-bold">
        <TableHeader className="border-b border-black dark:text-pageColor font-bold text-sm">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-b border-black  dark:text-pageColor font-bold"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  className="border-r border-black text-sm px-4 py-2 dark:text-pageColor hover:bg-transparent font-bold"
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

export default AllyBountyTable;
