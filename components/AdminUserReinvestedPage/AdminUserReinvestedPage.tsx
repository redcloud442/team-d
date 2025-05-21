"use client";
import { cn } from "@/lib/utils";
import { logError } from "@/services/Error/ErrorLogs";
import { getAdminUserReinvestedReport } from "@/services/User/Admin";
import { adminUserReinvestedReportData } from "@/utils/types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Separator } from "../ui/separator";
import AdminUserReinvestedTable from "./AdminUserReinvestedTable";

type FormData = {
  dateFilter: {
    start: Date | null;
    end: Date | null;
  };
};

const AdminUserReinvestedPage = () => {
  const supabaseClient = createClientComponentClient();

  const [isFetchingList, setIsFetchingList] = useState(false);
  const [page, setPage] = useState(1);
  const [reinvestedReportData, setReinvestedReportData] = useState<
    adminUserReinvestedReportData[]
  >([]);
  const [totalCount, setTotalCount] = useState(0);

  const { control, handleSubmit, getValues, setValue, watch } =
    useForm<FormData>({
      defaultValues: {
        dateFilter: {
          start: null,
          end: null,
        },
      },
    });

  const handleFetchTotalWithdrawalReport = async () => {
    try {
      const { dateFilter } = getValues();

      setIsFetchingList(true);

      const data = await getAdminUserReinvestedReport({
        dateFilter: {
          start: dateFilter.start ?? null,
          end: dateFilter.end ?? null,
        },
        take: 10,
        skip: page,
      });

      setReinvestedReportData(data.data);
      setTotalCount(data.totalCount);
    } catch (e) {
      if (e instanceof Error) {
        await logError(supabaseClient, {
          errorMessage: e.message,
          stackTrace: e.stack,
          stackPath: "components/AdminWithdrawalReportTable",
        });
      }
    } finally {
      setIsFetchingList(false);
    }
  };

  useEffect(() => {
    handleFetchTotalWithdrawalReport();
  }, [page]);

  const dateFilter = watch("dateFilter");

  return (
    <div className="mx-auto md:p-10">
      <div>
        <header className="mb-4">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            User Reinvested Page
          </h1>
          <p className="text-gray-600 dark:text-white">
            View all your user that have reinvested in the system
          </p>
        </header>

        <Separator className="my-4" />

        {/* Table Section */}

        <section className="rounded-lg flex flex-col gap-4">
          <Card className="w-full rounded-sm ">
            <CardHeader>
              <CardTitle>User Reinvested</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(handleFetchTotalWithdrawalReport)}>
                <div className="flex flex-col sm:flex-row w-full items-end gap-4 flex-wrap">
                  {/* Month Selection */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"card"}
                        className={cn(
                          "w-full rounded-md md:max-w-xl: justify-start text-left font-normal flex-1",
                          !dateFilter.start && "text-black"
                        )}
                      >
                        <CalendarIcon />
                        {dateFilter.start ? (
                          format(dateFilter.start, "PPP")
                        ) : (
                          <span>Start Date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Controller
                        control={control}
                        name="dateFilter.start"
                        render={({ field }) => (
                          <Calendar
                            mode="single"
                            selected={
                              dateFilter.start ? dateFilter.start : undefined
                            }
                            onSelect={(newDate) => {
                              field.onChange(newDate); // Update the form field value
                              setValue(
                                "dateFilter.start",
                                newDate ? newDate : null
                              ); // Manually set the value of the date field
                            }}
                            initialFocus
                          />
                        )}
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"card"}
                        className={cn(
                          "w-full rounded-md md:max-w-sm: justify-start text-left font-normal flex-1",
                          !dateFilter.end && "text-black"
                        )}
                      >
                        <CalendarIcon />

                        {dateFilter.end ? (
                          format(dateFilter.end, "PPP")
                        ) : (
                          <span>End Date</span>
                        )}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0" align="start">
                      <Controller
                        control={control}
                        name="dateFilter.end"
                        render={({ field }) => (
                          <Calendar
                            mode="single"
                            selected={
                              dateFilter.end ? dateFilter.end : undefined
                            }
                            onSelect={(newDate) => {
                              field.onChange(newDate); // Update the form field value
                              setValue(
                                "dateFilter.end",
                                newDate ? newDate : null
                              ); // Manually set the value of the date field
                            }}
                            initialFocus
                          />
                        )}
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant={"card"}
                    className="w-full md:w-auto rounded-md"
                  >
                    Submit
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          <AdminUserReinvestedTable
            setActivePage={setPage}
            activePage={page}
            totalCount={totalCount}
            reinvestedReportData={reinvestedReportData}
            isFetchingList={isFetchingList}
          />
        </section>
      </div>
    </div>
  );
};

export default AdminUserReinvestedPage;
