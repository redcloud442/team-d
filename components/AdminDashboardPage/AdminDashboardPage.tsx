"use client";

import { getAdminDashboard } from "@/services/Dasboard/Admin";
import { createClientSide } from "@/utils/supabase/client";
import { ChartData } from "@/utils/types";
import { alliance_member_table } from "@prisma/client";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import TableLoading from "../ui/tableLoading";
import AdminDashboardCard from "./AdminDashboardCard";
import AdminDashboardChart from "./AdminDashboardChart";
import AdminDashboardTable from "./AdminDashboardTable";
type Props = {
  teamMemberProfile: alliance_member_table;
};

type FormContextType = {
  dateFilter: {
    start: string;
    end: string;
  };
};

const AdminDashboardPage = ({ teamMemberProfile }: Props) => {
  const supabaseClient = createClientSide();
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalWithdraw, setTotalWithdraw] = useState(0);
  const [directLoot, setDirectLoot] = useState(0);
  const [indirectLoot, setIndirectLoot] = useState(0);
  const [activePackageWithinTheDay, setActivePackageWithinTheDay] = useState(0);
  const [numberOfRegisteredUser, setNumberOfRegisteredUser] = useState(0);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const filterMethods = useForm<FormContextType>({
    defaultValues: {
      dateFilter: {
        start: undefined,
        end: undefined,
      },
    },
  });

  const { getValues, control, handleSubmit, watch } = filterMethods;

  const fetchAdminDashboardData = async () => {
    try {
      if (!teamMemberProfile) return;
      setIsLoading(true);
      const { dateFilter } = getValues();

      const startDate = dateFilter.start
        ? new Date(dateFilter.start)
        : undefined;

      const endDate = dateFilter.end ? new Date(dateFilter.end) : undefined;
      const {
        totalEarnings,
        totalWithdraw,
        directLoot,
        indirectLoot,
        activePackageWithinTheDay,
        numberOfRegisteredUser,
        chartData,
      } = await getAdminDashboard(supabaseClient, {
        teamMemberId: teamMemberProfile.alliance_member_id,
        dateFilter: {
          start:
            startDate && !isNaN(startDate.getTime())
              ? startDate.toISOString()
              : "",
          end:
            endDate && !isNaN(endDate.getTime())
              ? new Date(endDate.setHours(23, 59, 59, 999)).toISOString()
              : "",
        },
      });

      setDirectLoot(directLoot);
      setIndirectLoot(indirectLoot);
      setTotalEarnings(totalEarnings);
      setTotalWithdraw(totalWithdraw);
      setChartData(chartData);
      setActivePackageWithinTheDay(activePackageWithinTheDay);
      setNumberOfRegisteredUser(numberOfRegisteredUser);
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminDashboardData();
  }, [teamMemberProfile]);

  const startDate = watch("dateFilter.start");
  const endDate = watch("dateFilter.end");

  return (
    <div className="mx-auto md:p-10 space-y-6">
      {isLoading && <TableLoading />}
      <div className="flex items-center justify-between">
        <h1 className="Title">Admin Dashboard</h1>
        <form
          onSubmit={handleSubmit(fetchAdminDashboardData)}
          className="flex flex-wrap items-center gap-2"
        >
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
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date: Date | undefined) =>
                      field.onChange(date?.toISOString() || "")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          <Controller
            name="dateFilter.end"
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
                      : "Select End Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date: Date | undefined) =>
                      field.onChange(date?.toISOString() || "")
                    }
                    fromDate={startDate ? new Date(startDate) : undefined}
                    disabled={(date) =>
                      startDate ? date < new Date(startDate) : false
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          <Button disabled={!startDate || !endDate} type="submit">
            Submit
          </Button>
        </form>
      </div>
      <div className="flex flex-col gap-6">
        <div>
          <AdminDashboardCard
            totalEarnings={totalEarnings}
            totalWithdraw={totalWithdraw}
            directLoot={directLoot}
            indirectLoot={indirectLoot}
            activePackageWithinTheDay={activePackageWithinTheDay}
            numberOfRegisteredUser={numberOfRegisteredUser}
          />
        </div>
        <div>
          <AdminDashboardChart chartData={chartData} />
        </div>
        <div>
          <AdminDashboardTable teamMemberProfile={teamMemberProfile} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
