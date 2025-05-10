import {
  ColumnDef,
  flexRender,
  Table as ReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import TableLoading from "../ui/tableLoading";
type Props<T> = {
  table: ReactTable<T>;
  columns: ColumnDef<T>[];
  activePage: number;
  totalCount: number;
  isFetchingList: boolean;
  setActivePage: Dispatch<SetStateAction<number>>;
  pageCount: number;
};

const ReusableTable = <T extends object>({
  table,
  columns,
  activePage,
  totalCount,
  isFetchingList,
  setActivePage,
  pageCount,
}: Props<T>) => {
  return (
    <>
      <ScrollArea className="relative w-full overflow-x-auto border border-orange-500 rounded-md shadow-md">
        {isFetchingList && <TableLoading />}

        <Table className="relative min-w-full table-auto border-separate border-spacing-0 bg-zinc-950 border-zinc-800 text-sm">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-orange-950 text-white dark:text-white"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="py-2 px-4 text-center font-bold tracking-wide uppercase border-b border-orange-600"
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
            {table.getExpandedRowModel().rows.length ? (
              table.getExpandedRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="transition duration-200 hover:bg-orange-100/10 hover:shadow-inner dark:hover:bg-yellow-400/10"
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="py-3 px-4 border-b border-zinc-700 text-zinc-200"
                    >
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
                  className="h-40 text-center text-zinc-500"
                >
                  No data found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          <tfoot>
            <TableRow>
              <TableCell className="px-0" colSpan={columns.length}>
                <div className="flex justify-between items-center py-2 px-4 bg-zinc-900 border-t border-zinc-700">
                  <span className="text-sm text-yellow-400 font-medium">
                    Results {Math.min(activePage * 10, totalCount)} /{" "}
                    {totalCount}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          </tfoot>
        </Table>

        <ScrollBar
          className="h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded"
          orientation="horizontal"
        />
      </ScrollArea>

      <div className="flex items-center justify-end gap-x-4 py-4">
        {activePage > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActivePage((prev) => Math.max(prev - 1, 1))}
            className="bg-orange-950 text-white hover:bg-orange-600 transition-all duration-200 rounded-lg shadow-md"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        <div className="flex space-x-2">
          {(() => {
            const maxVisiblePages = 3;
            const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
            let displayedPages = [];

            if (pageCount <= maxVisiblePages) {
              displayedPages = pages;
            } else {
              if (activePage <= 2) {
                displayedPages = [1, 2, 3, "...", pageCount];
              } else if (activePage >= pageCount - 1) {
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
                  onClick={() => setActivePage(page)}
                  size="sm"
                  className={`${
                    activePage === page
                      ? "bg-orange-500 text-zinc-900 font-bold shadow-md"
                      : "border border-zinc-700 text-zinc-300 hover:bg-orange-500 hover:text-white"
                  } rounded-lg px-3 py-2 transition-all duration-200`}
                >
                  {page}
                </Button>
              ) : (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-1 text-zinc-600 dark:text-zinc-400"
                >
                  {page}
                </span>
              )
            );
          })()}
        </div>

        {activePage < pageCount && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setActivePage((prev) => Math.min(prev + 1, pageCount))
            }
            className="bg-orange-500 text-white hover:bg-orange-600 transition-all duration-200 rounded-lg shadow-md"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </>
  );
};

export default ReusableTable;
