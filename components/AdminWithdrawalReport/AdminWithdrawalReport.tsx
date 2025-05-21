"use client";
import { Controller, useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

import { cn } from "@/lib/utils";
import { getAdminWithdrawalReport } from "@/services/Withdrawal/Admin";
import { useRole } from "@/utils/context/roleContext";
import { format } from "date-fns"; // If you're using date-fns
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Separator } from "../ui/separator";
import AdminWithdrawalReportTable from "./AdminWithdrawalReportTable";

type FormData = {
  dateFilter: {
    startDate: Date | null;
    endDate: Date | null;
  };
};

const AdminWithdrawalReport = () => {
  const { teamMemberProfile } = useRole();
  const [isFetchingList, setIsFetchingList] = useState(false);
  const [withdrawalReportData, setWithdrawalReportData] = useState<{
    total_amount: number;
    total_request: number;
  }>({
    total_amount: 0,
    total_request: 0,
  });

  const { control, handleSubmit, setValue, watch } = useForm<FormData>({
    defaultValues: {
      dateFilter: {
        startDate: null,
        endDate: null,
      },
    },
  });

  const dateFilter = watch("dateFilter");

  const onSubmit = async (data: FormData) => {
    try {
      const { startDate, endDate } = data.dateFilter;

      const { total_amount, total_request } = await getAdminWithdrawalReport({
        dateFilter: {
          startDate: startDate?.toISOString() || "",
          endDate: endDate?.toISOString() || "",
        },
      });

      setWithdrawalReportData({
        total_amount,
        total_request,
      });
    } catch (error) {
      setIsFetchingList(false);
    } finally {
      setIsFetchingList(false);
    }
  };

  useEffect(() => {
    const handleFetchTotalWithdrawalReport = async () => {
      await onSubmit({
        dateFilter: {
          startDate: null,
          endDate: null,
        },
      });
    };

    handleFetchTotalWithdrawalReport();
  }, []);

  return (
    <div className="mx-auto md:p-10">
      <div>
        <header className="mb-4">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Withdrawal Report Page
          </h1>
          <p className="text-gray-600 dark:text-white">
            View all the withdrawal report that are currently in the system.
          </p>
        </header>

        <Separator className="my-4" />

        {/* Table Section */}

        <section className="rounded-lg flex flex-col gap-4">
          <Card className="w-full rounded-sm ">
            <CardHeader>
              <CardTitle>Withdrawal Report</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col sm:flex-row w-full items-end gap-4 flex-wrap">
                  {/* Date Picker */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"card"}
                        className={cn(
                          "w-full rounded-md flex-1 justify-start text-left font-normal",
                          !dateFilter.startDate && "text-black"
                        )}
                      >
                        <CalendarIcon />
                        {dateFilter.startDate ? (
                          format(dateFilter.startDate, "PPP")
                        ) : (
                          <span>Start Date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Controller
                        control={control}
                        name="dateFilter.startDate"
                        render={({ field }) => (
                          <Calendar
                            mode="single"
                            selected={
                              dateFilter.startDate
                                ? dateFilter.startDate
                                : undefined
                            }
                            onSelect={(newDate) => {
                              field.onChange(newDate); // Update the form field value
                              setValue(
                                "dateFilter.startDate",
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
                          "w-full rounded-md  justify-start text-left font-normal flex-1",
                          !dateFilter.endDate && "text-black"
                        )}
                      >
                        <CalendarIcon />

                        {dateFilter.endDate ? (
                          format(dateFilter.endDate, "PPP")
                        ) : (
                          <span>End Date</span>
                        )}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0" align="start">
                      <Controller
                        control={control}
                        name="dateFilter.endDate"
                        render={({ field }) => (
                          <Calendar
                            mode="single"
                            selected={
                              dateFilter.endDate
                                ? dateFilter.endDate
                                : undefined
                            }
                            onSelect={(newDate) => {
                              field.onChange(newDate); // Update the form field value
                              setValue(
                                "dateFilter.endDate",
                                newDate ? newDate : null
                              ); // Manually set the value of the date field
                            }}
                            initialFocus
                          />
                        )}
                      />
                    </PopoverContent>
                  </Popover>

                  <Button
                    type="submit"
                    className=" w-full rounded-md md:w-auto btn btn-primary"
                    variant={"card"}
                  >
                    Submit
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          <AdminWithdrawalReportTable
            withdrawalReportData={withdrawalReportData}
            teamMemberProfile={teamMemberProfile}
          />
        </section>
      </div>
    </div>
  );
};

export default AdminWithdrawalReport;
