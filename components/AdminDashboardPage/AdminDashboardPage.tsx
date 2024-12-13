"use client";

import { useToast } from "@/hooks/use-toast";
import { getTotalReferral } from "@/services/Bounty/Admin";
import { getAdminDashboard } from "@/services/Dasboard/Admin";
import { logError } from "@/services/Error/ErrorLogs";
import { createClientSide } from "@/utils/supabase/client";
import { ChartData } from "@/utils/types";
import {
  alliance_member_table,
  alliance_referral_link_table,
} from "@prisma/client";
import { format } from "date-fns";
import {
  CalendarIcon,
  Package2Icon,
  PhilippinePeso,
  User2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import CardAmountAdmin from "../ui/CardAmountAdmin";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import TableLoading from "../ui/tableLoading";
import AdminDashboardCard from "./AdminDashboardCard";
import AdminDashboardChart from "./AdminDashboardChart";
import AdminDashboardTable from "./AdminDashboardTable";
type Props = {
  teamMemberProfile: alliance_member_table;
  referral: alliance_referral_link_table;
};

type FormContextType = {
  dateFilter: {
    start: string;
    end: string;
  };
};

const AdminDashboardPage = ({ teamMemberProfile, referral }: Props) => {
  const supabaseClient = createClientSide();
  const router = useRouter();
  const { toast } = useToast();
  const [copySuccess, setCopySuccess] = useState("");
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalWithdraw, setTotalWithdraw] = useState(0);
  const [directLoot, setDirectLoot] = useState(0);
  const [indirectLoot, setIndirectLoot] = useState(0);
  const [activePackageWithinTheDay, setActivePackageWithinTheDay] = useState(0);
  const [numberOfRegisteredUser, setNumberOfRegisteredUser] = useState(0);
  const [totalActivatedPackage, setTotalActivatedPackage] = useState(0);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalReferral, setTotalReferral] = useState(0);
  const filterMethods = useForm<FormContextType>({
    defaultValues: {
      dateFilter: {
        start: undefined,
        end: undefined,
      },
    },
  });

  const { getValues, control, handleSubmit, watch } = filterMethods;

  const formatDateToLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchAdminDashboardData = async () => {
    try {
      if (!teamMemberProfile) return;
      setIsLoading(true);
      const { dateFilter } = getValues();

      const startDate = dateFilter.start
        ? new Date(dateFilter.start)
        : undefined;
      const formattedStartDate = startDate ? formatDateToLocal(startDate) : "";

      const endDate = dateFilter.end ? new Date(dateFilter.end) : undefined;
      const formattedEndDate = endDate
        ? formatDateToLocal(new Date(endDate.setHours(23, 59, 59, 999)))
        : "";

      const {
        totalEarnings,
        totalWithdraw,
        directLoot,
        indirectLoot,
        activePackageWithinTheDay,
        numberOfRegisteredUser,
        totalActivatedPackage,
        chartData,
      } = await getAdminDashboard(supabaseClient, {
        teamMemberId: teamMemberProfile.alliance_member_id,
        dateFilter: {
          start: formattedStartDate,
          end: formattedEndDate,
        },
      });

      setDirectLoot(directLoot);
      setIndirectLoot(indirectLoot);
      setTotalEarnings(totalEarnings);
      setTotalWithdraw(totalWithdraw);
      setChartData(chartData);
      setActivePackageWithinTheDay(activePackageWithinTheDay);
      setNumberOfRegisteredUser(numberOfRegisteredUser);
      setTotalActivatedPackage(totalActivatedPackage);

      const totalReferral = await getTotalReferral(supabaseClient, {
        teamMemberId: teamMemberProfile.alliance_member_id,
      });

      setTotalReferral(totalReferral);
    } catch (e) {
      if (e instanceof Error) {
        await logError(supabaseClient, {
          errorMessage: e.message,
          stackTrace: e.stack,
          stackPath: "components/AdminDashboardPage/AdminDashboardPage.tsx",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminDashboardData();
  }, [teamMemberProfile]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referral.alliance_referral_link);
      toast({
        title: "Link copied!",
        description: "Link copied to clipboard",
        variant: "success",
      });
    } catch (err) {}
  };
  const startDate = watch("dateFilter.start");
  const endDate = watch("dateFilter.end");

  return (
    <div className="mx-auto md:p-10 space-y-6">
      {isLoading && <TableLoading />}
      <div className="flex flex-col md:flex-row items-center justify-between">
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
          <Button
            className="w-full md:w-auto"
            disabled={!startDate || !endDate}
            type="submit"
          >
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
        <Card className="w-full md:min-w-md">
          <CardHeader>
            <CardTitle> Total Referral</CardTitle>
            <CardDescription className="flex gap-x-2 text-xl font-bold">
              <PhilippinePeso />
              {totalReferral.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-x-2">
              <Input
                type="text"
                value={referral.alliance_referral_link}
                readOnly
              />
              <Button onClick={handleCopyLink}>Copy Link</Button>
              <Button onClick={() => router.push("/direct-loot")}>
                Direct Loot
              </Button>
              <Button onClick={() => router.push("/indirect-loot")}>
                Indirect Loot
              </Button>
            </div>
          </CardContent>
        </Card>
        <CardAmountAdmin
          title="Total Registered User"
          value={
            <>
              <User2 />
              {numberOfRegisteredUser}
            </>
          }
          description=""
          descriptionClassName="text-sm text-gray-500"
        />

        <CardAmountAdmin
          title="Total Activated Package"
          value={
            <>
              <Package2Icon />
              {totalActivatedPackage}
            </>
          }
          description=""
          descriptionClassName="text-sm text-gray-500"
        />
        <div>
          <AdminDashboardTable teamMemberProfile={teamMemberProfile} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
