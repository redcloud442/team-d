import { TopUpRequestData } from "@/utils/types";
import {
  ColumnDef,
  flexRender,
  Table as ReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

type Props = {
  table: ReactTable<TopUpRequestData>;
  columns: ColumnDef<TopUpRequestData>[];
  activePage: number;
  totalCount: number;
};

const AdminTopUpApprovalTabs = ({
  table,
  columns,
  activePage,
  totalCount,
}: Props) => {
  return (
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
  );
};

export default AdminTopUpApprovalTabs;
