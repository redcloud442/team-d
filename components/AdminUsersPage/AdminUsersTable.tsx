"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminUserRequest } from "@/services/User/Admin";
import { escapeFormData } from "@/utils/function";
import { createClientSide } from "@/utils/supabase/client";
import { UserRequestdata } from "@/utils/types";
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
import { format } from "date-fns";
import {
  CalendarIcon,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import TableLoading from "../ui/tableLoading";
import { AdminUsersColumn } from "./AdminUsersColumn";

type DataTableProps = {
  teamMemberProfile: alliance_member_table;
};

type FilterFormValues = {
  usernameFilter: string;
  userRestricted?: string;
  userRole?: string;
  dateCreated?: string;
};

const AdminUsersTable = ({ teamMemberProfile }: DataTableProps) => {
  const supabaseClient = createClientSide();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [requestData, setRequestData] = useState<UserRequestdata[]>([]);
  const [requestCount, setRequestCount] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [isFetchingList, setIsFetchingList] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const columnAccessor = sorting?.[0]?.id || "user_date_created";
  const isAscendingSort =
    sorting?.[0]?.desc === undefined ? true : !sorting[0].desc;

  const fetchAdminRequest = async () => {
    try {
      if (!teamMemberProfile) return;
      setIsFetchingList(true);

      const sanitizedData = escapeFormData(getValues());

      const { usernameFilter, userRole, dateCreated } = sanitizedData;

      const startDate = dateCreated ? new Date(dateCreated) : undefined;
      const { data, totalCount } = await getAdminUserRequest(supabaseClient, {
        teamId: teamMemberProfile.alliance_member_alliance_id,
        teamMemberId: teamMemberProfile.alliance_member_id,
        page: activePage,
        limit: 10,
        columnAccessor: columnAccessor,
        isAscendingSort: isAscendingSort,
        search: usernameFilter,
        userRole: userRole,
        dateCreated: startDate ? startDate.toISOString() : undefined,
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
      await fetchAdminRequest();
    } catch (e) {}
  };

  const columns = AdminUsersColumn(fetchAdminRequest);

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

  const { register, handleSubmit, getValues, control, reset } =
    useForm<FilterFormValues>({
      defaultValues: {
        usernameFilter: "",
        userRestricted: "",
        userRole: "",
        dateCreated: "",
      },
    });

  useEffect(() => {
    fetchAdminRequest();
  }, [supabaseClient, teamMemberProfile, activePage, sorting]);

  const pageCount = Math.ceil(requestCount / 13);

  const handleSwitchChange = (checked: boolean) => {
    setShowFilters(checked);
    if (!checked) {
      reset();
      handleSubmit(handleFilter)();
    }
  };

  return (
    <Card className="w-full rounded-sm p-4">
      <div className="flex items-center py-4">
        <form
          className="flex flex-wrap flex-col gap-6"
          onSubmit={handleSubmit(handleFilter)}
        >
          <div className="flex gap-2">
            <Input
              {...register("usernameFilter")}
              placeholder="Filter username..."
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
            <Button
              onClick={fetchAdminRequest}
              disabled={isFetchingList}
              size="sm"
            >
              <RefreshCw />
              Refresh
            </Button>
            <div className="flex items-center space-x-2">
              <Switch
                id="filter-switch"
                checked={showFilters}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="filter">Filter</Label>
            </div>
          </div>
          <div className="flex gap-2">
            {showFilters && (
              <>
                <Controller
                  name="userRole"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === field.value ? "" : value)
                      }
                      value={field.value || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="User Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MEMBER">Member</SelectItem>
                        <SelectItem value="MERCHANT">Merchant</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />

                <Controller
                  name="dateCreated"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="font-normal justify-start"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(new Date(field.value), "PPP")
                            : "Date Created"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date: Date | undefined) =>
                            field.onChange(date?.toISOString() || "")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />

                {/* End Date Picker */}

                <Button onClick={fetchAdminRequest}>Submit</Button>
              </>
            )}
          </div>
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

      <ScrollArea className="w-full overflow-x-auto ">
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

          <tfoot>
            <TableRow>
              <TableCell className="px-0" colSpan={columns.length}>
                <div className="flex justify-between items-center border-t px-2 pt-2">
                  <span className="text-sm text-gray-600">
                    Showing {requestData.length} of {requestCount} entries
                  </span>
                </div>
              </TableCell>
            </TableRow>
          </tfoot>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="flex items-center justify-end w-full gap-x-4 py-4 ">
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

export default AdminUsersTable;
