import {
  ColumnDef,
  flexRender,
  Table as ReactTable,
} from "@tanstack/react-table";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

type LeaderboardData = {
  username: string;
  totalAmount: number;
};

type Props = {
  table: ReactTable<LeaderboardData>;
  columns: ColumnDef<LeaderboardData>[];
  activePage: number;
  totalCount: number;
};

const AdminLeaderBoardsTabTable = ({
  table,
  columns,
  activePage,
  totalCount,
}: Props) => {
  return (
    <ScrollArea className="w-full overflow-x-auto ">
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
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
                  Showing {Math.min(activePage * 10, totalCount)} out of{" "}
                  {totalCount} entries
                </span>
              </div>
            </TableCell>
          </TableRow>
        </tfoot>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default AdminLeaderBoardsTabTable;
