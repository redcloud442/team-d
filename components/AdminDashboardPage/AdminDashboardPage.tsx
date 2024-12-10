"use client";

import { getAdminDashboard } from "@/services/Dasboard/Admin";
import { createClientSide } from "@/utils/supabase/client";
import { ChartData } from "@/utils/types";
import { alliance_member_table } from "@prisma/client";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import TableLoading from "../ui/tableLoading";
import AdminDashboardCard from "./AdminDashboardCard";
import AdminDashboardChart from "./AdminDashboardChart";
import AdminDashboardTable from "./AdminDashboardTable";
type Props = {
  teamMemberProfile: alliance_member_table;
};

type FormContextType = {
  dateFilter: string;
};

const AdminDashboardPage = ({ teamMemberProfile }: Props) => {
  const supabaseClient = createClientSide();
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalWithdraw, setTotalWithdraw] = useState(0);
  const [totalLoot, setTotalLoot] = useState(0);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const filterMethods = useForm<FormContextType>({
    defaultValues: {
      dateFilter: "90 days",
    },
  });

  const { getValues } = filterMethods;

  const fetchAdminDashboardData = async () => {
    try {
      if (!teamMemberProfile) return;
      setIsLoading(true);
      const { dateFilter } = getValues();

      const { totalEarnings, totalWithdraw, totalLoot, chartData } =
        await getAdminDashboard(supabaseClient, {
          teamMemberId: teamMemberProfile.alliance_member_id,
          dateFilter: dateFilter,
        });

      setTotalLoot(totalLoot);
      setTotalEarnings(totalEarnings);
      setTotalWithdraw(totalWithdraw);
      setChartData(chartData);
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminDashboardData();
  }, [teamMemberProfile]);

  return (
    <div className="mx-auto p-10">
      {isLoading && <TableLoading />}
      <div className="w-full flex flex-col gap-6 max-w-6xl p-4">
        <div>
          <h1 className="Title">Admin Dashboard</h1>
          <AdminDashboardCard
            totalEarnings={totalEarnings}
            totalWithdraw={totalWithdraw}
            totalLoot={totalLoot}
          />
        </div>
        <div>
          <FormProvider {...filterMethods}>
            <AdminDashboardChart
              fetchAdminDashboardData={fetchAdminDashboardData}
              chartData={chartData}
            />
          </FormProvider>
        </div>
        <div>
          <AdminDashboardTable teamMemberProfile={teamMemberProfile} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
