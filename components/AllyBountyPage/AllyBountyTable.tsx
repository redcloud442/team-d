"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getReferralType } from "@/services/Bounty/Member";
import { useRole } from "@/utils/context/roleContext";
import { ReferralType } from "@/utils/types";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, CalendarIcon, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import GenericTableList from "../ReusableCardList/ReusableCardList";
import { Calendar } from "../ui/calendar";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { AllyBountyColumn } from "./AllyBountyColum";

type Props = {
  type: ReferralType;
};

type FormValues = {
  search: string;
  date: Date | undefined;
};

const PAGE_LIMIT = 10;

const ReferralTable = ({ type }: Props) => {
  const { teamMemberProfile } = useRole();

  const [countdown, setCountdown] = useState(0);
  const [selectedType, setSelectedType] = useState<ReferralType>(type);
  const [formValues, setFormValues] = useState<FormValues>({
    search: "",
    date: undefined,
  });

  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const columnAccessor = "user_date_created";
  const isAscendingSort = true;

  const form = useForm<FormValues>({
    defaultValues: {
      search: "",
      date: undefined,
    },
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: [
      "referral",
      teamMemberProfile?.company_member_id,
      selectedType,
      formValues.search,
      formValues.date,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const { search, date } = form.getValues();
      return await getReferralType({
        page: pageParam,
        limit: PAGE_LIMIT,
        columnAccessor,
        isAscendingSort,
        search: search || "",
        date: date || undefined,
        type: selectedType,
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.flatMap((p) => p.data).length;
      if (totalLoaded < (lastPage.totalCount || 0)) {
        return allPages.length + 1;
      }
      return undefined;
    },

    enabled: !!teamMemberProfile,
    staleTime: 1000 * 60 * 2, // Cache is fresh for 2 mins
    gcTime: 1000 * 60 * 2, // Cache is stale for 2 mins
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    initialPageParam: 1,
  });

  const columns = AllyBountyColumn(selectedType);

  const flatData = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  const handleNextPage = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const handleRefresh = () => {
    refetch();
    setCountdown(30);
    queryClient.invalidateQueries({
      queryKey: [
        "referral",
        teamMemberProfile?.company_member_id,
        selectedType,
      ],
    });

    // Clear previous interval if exists
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start new countdown
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleChangeType = (value: string) => {
    form.reset();
    setFormValues({
      search: "",
      date: undefined,
    });
    setSelectedType(value as Props["type"]);

    window.history.pushState({}, "", `/referral/${value.toLowerCase()}`);
  };

  const onSubmit = (data: FormValues) => {
    setFormValues(data);
  };

  return (
    <div>
      <div className="mb-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="space-x-1">
            <span className="text-2xl font-normal text-white">
              {selectedType === "new-register"
                ? "New Register"
                : `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Referral`}
            </span>
          </div>

          <div className="flex justify-end items-end">
            <Link href="/digi-dash">
              <Button className="font-black rounded-lg px-4 dark:bg-white text-black">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <Form {...form}>
            <form
              className="flex justify-between gap-2"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="search"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input
                        type="text"
                        variant="non-card"
                        placeholder="Search"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal h-10 border-2",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value as Date, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value as Date}
                          onSelect={field.onChange}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isLoading || form.formState.isSubmitting}
                className="rounded-lg h-10"
              >
                Search
              </Button>
            </form>
          </Form>

          <div className="flex justify-between gap-2">
            <Select
              onValueChange={handleChangeType}
              defaultValue={selectedType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a transaction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">Direct</SelectItem>
                <SelectItem value="unilevel">Unilevel</SelectItem>
                <SelectItem value="new-register">New Register</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleRefresh}
              disabled={isLoading || countdown > 0}
              className="flex items-center gap-2 px-4 py-2  rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw
                size={16}
                className={isLoading ? "animate-spin" : ""}
              />
              Refresh {countdown > 0 ? `(${countdown}s)` : ""}
            </Button>
          </div>
        </div>
      </div>
      <GenericTableList
        data={flatData}
        count={data?.pages[0]?.totalCount || 0}
        isLoading={isLoading || isFetchingNextPage}
        onLoadMore={handleNextPage}
        columns={columns}
        emptyMessage="No data found."
        getRowId={(item) => item.package_ally_bounty_log_id}
      />
    </div>
  );
};

export default ReferralTable;
