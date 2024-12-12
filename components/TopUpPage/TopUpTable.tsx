"use client";

import { getUserOptions } from "@/services/Options/Options";
import { getMerchantTopUpRequest } from "@/services/TopUp/Member";
import { escapeFormData } from "@/utils/function";
import { createClientSide } from "@/utils/supabase/client";
import { TopUpRequestData } from "@/utils/types";
import { alliance_member_table, user_table } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import {
  ColumnFiltersState,
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
  Loader2,
  PhilippinePeso,
  RefreshCw,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Card } from "../ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { TopUpColumn } from "./TopUpColumn";
import TopUpTabs from "./TopUpTabs";

type DataTableProps = {
  teamMemberProfile: alliance_member_table;
};

type FilterFormValues = {
  referenceId: string;
  userFilter: string;
  statusFilter: string;
  rejectNote: string;
  dateFilter: { start: string; end: string };
};

const TopUpTable = ({ teamMemberProfile }: DataTableProps) => {
  const supabaseClient = createClientSide();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [requestData, setRequestData] = useState<TopUpRequestData[]>([]);
  const [requestCount, setRequestCount] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [isFetchingList, setIsFetchingList] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [statusCount, setStatusCount] = useState({
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
  });
  const [merchantBalance, setMerchantBalance] = useState(0);
  const columnAccessor = sorting?.[0]?.id || "alliance_top_up_request_date";
  const isAscendingSort =
    sorting?.[0]?.desc === undefined ? true : !sorting[0].desc;
  const [userOptions, setUserOptions] = useState<user_table[]>([]);

  const fetchRequest = async () => {
    try {
      if (!teamMemberProfile) return;
      setIsFetchingList(true);

      const sanitizedData = escapeFormData(getValues());

      const { referenceId, userFilter, statusFilter, dateFilter } =
        sanitizedData;
      const startDate = dateFilter.start
        ? new Date(dateFilter.start)
        : undefined;
      const endDate = startDate ? new Date(startDate) : undefined;
      const { data, totalCount, merchantBalance, count } =
        await getMerchantTopUpRequest(supabaseClient, {
          teamId: teamMemberProfile.alliance_member_alliance_id,
          teamMemberId: teamMemberProfile.alliance_member_id,
          page: activePage,
          limit: 10,
          columnAccessor: columnAccessor,
          isAscendingSort: isAscendingSort,
          search: referenceId,
          userFilter,
          statusFilter: statusFilter ?? "PENDING",
          dateFilter: {
            start:
              startDate && !isNaN(startDate.getTime())
                ? startDate.toISOString()
                : undefined,
            end:
              endDate && !isNaN(endDate.getTime())
                ? new Date(endDate.setHours(23, 59, 59, 999)).toISOString()
                : undefined,
          },
        });

      setStatusCount(count);
      setRequestData(data || []);
      setRequestCount(totalCount || 0);
      setMerchantBalance(merchantBalance || 0);
    } catch (e) {
      console.log(e);
    } finally {
      setIsFetchingList(false);
    }
  };

  const handleFilter = async () => {
    try {
      await fetchRequest();
    } catch (e) {}
  };

  const {
    columns,
    isOpenModal,
    isLoading,
    setIsOpenModal,
    handleUpdateStatus,
  } = TopUpColumn(fetchRequest);

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

  const { register, handleSubmit, watch, getValues, control, reset, setValue } =
    useForm<FilterFormValues>({
      defaultValues: {
        referenceId: "",
        userFilter: "",
        statusFilter: "PENDING",
        dateFilter: {
          start: undefined,
          end: undefined,
        },
        rejectNote: "",
      },
    });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const pageLimit = 500;

        let currentUserPage = 1;

        let allUserOptions: user_table[] = [];

        while (true) {
          const userData = await getUserOptions(supabaseClient, {
            page: currentUserPage,
            limit: pageLimit,
            teamMemberId: teamMemberProfile.alliance_member_id,
          });

          if (!userData?.length) {
            break;
          }

          allUserOptions = [...allUserOptions, ...userData];

          if (userData.length < pageLimit) {
            break;
          }

          currentUserPage += 1;
        }

        setUserOptions(allUserOptions);
      } catch (e) {}
    };

    fetchOptions();
  }, [supabaseClient, teamMemberProfile.alliance_member_id]);

  useEffect(() => {
    fetchRequest();
  }, [supabaseClient, teamMemberProfile, activePage, sorting]);

  const pageCount = Math.ceil(requestCount / 10);

  const handleSwitchChange = (checked: boolean) => {
    setShowFilters(checked);
    if (!checked) {
      reset();
      handleSubmit(handleFilter)();
    }
  };
  const handleTabChange = (type?: string) => {
    setValue("statusFilter", type as "PENDING" | "APPROVED" | "REJECTED");
    fetchRequest();
  };

  const rejectNote = watch("rejectNote");
  return (
    <Card className="w-full rounded-sm p-4">
      <div className="flex flex-wrap gap-4 items-start py-4">
        <form
          className="flex flex-col gap-6 w-full max-w-2xl rounded-md"
          onSubmit={handleSubmit(handleFilter)}
        >
          {isOpenModal && (
            <Dialog
              open={isOpenModal.open}
              onOpenChange={(open) => setIsOpenModal({ ...isOpenModal, open })}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isOpenModal.status} Request</DialogTitle>
                </DialogHeader>
                {isOpenModal.status === "REJECTED" && (
                  <Controller
                    name="rejectNote"
                    control={control}
                    rules={{ required: "Rejection note is required" }}
                    render={({ field, fieldState }) => (
                      <div className="flex flex-col gap-2">
                        <Textarea
                          placeholder="Enter the reason for rejection..."
                          {...field}
                        />
                        {fieldState.error && (
                          <span className="text-red-500 text-sm">
                            {fieldState.error.message}
                          </span>
                        )}
                      </div>
                    )}
                  />
                )}
                <div className="flex justify-end gap-2 mt-4">
                  <DialogClose asChild>
                    <Button variant="secondary">Cancel</Button>
                  </DialogClose>
                  <Button
                    disabled={isLoading}
                    onClick={() =>
                      handleUpdateStatus(
                        isOpenModal.status,
                        isOpenModal.requestId,
                        rejectNote
                      )
                    }
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : isOpenModal.status === "REJECTED" ? (
                      "Confirm Rejection"
                    ) : (
                      "Confirm Approval"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <div className="flex flex-wrap gap-2 items-center w-full">
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
            <div className="flex items-center space-x-2">
              <Switch
                id="filter-switch"
                checked={showFilters}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="filter">Filter</Label>
            </div>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-2 items-center rounded-md ">
              <Controller
                name="userFilter"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === field.value ? "" : value)
                    }
                    value={field.value || ""}
                  >
                    <SelectTrigger className="w-full sm:w-auto">
                      <SelectValue placeholder="Requestor" />
                    </SelectTrigger>
                    <SelectContent>
                      {userOptions.map((opt) => (
                        <SelectItem key={opt.user_id} value={opt.user_id}>
                          {opt.user_username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />

              <Controller
                name="dateFilter.start"
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
                          : "Select Start Date"}
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

              <Button type="submit" onClick={fetchRequest}>
                Submit
              </Button>
            </div>
          )}
        </form>
        <div className="flex justify-end gap-2 ">
          <div className="flex gap-2 items-center">
            Merchant Balance: <PhilippinePeso size={16} />
            {merchantBalance.toLocaleString()}
          </div>
        </div>
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

        <Tabs defaultValue="PENDING" onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="PENDING">
              Pending ({statusCount.PENDING})
            </TabsTrigger>
            <TabsTrigger value="APPROVED">
              Approved ({statusCount.APPROVED})
            </TabsTrigger>
            <TabsTrigger value="REJECTED">
              Rejected ({statusCount.REJECTED})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="PENDING">
            <TopUpTabs
              table={table}
              columns={columns}
              activePage={activePage}
              totalCount={requestCount}
            />
          </TabsContent>

          <TabsContent value="APPROVED">
            <TopUpTabs
              table={table}
              columns={columns}
              activePage={activePage}
              totalCount={requestCount}
            />
          </TabsContent>

          <TabsContent value="REJECTED">
            <TopUpTabs
              table={table}
              columns={columns}
              activePage={activePage}
              totalCount={requestCount}
            />
          </TabsContent>
        </Tabs>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

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
  );
};

export default TopUpTable;
