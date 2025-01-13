"use client";

import { getDashboard, getDashboardEarnings } from "@/services/Dasboard/Member";
import { logError } from "@/services/Error/ErrorLogs";
import { createClientSide } from "@/utils/supabase/client";
import { ChartDataMember, DashboardEarnings } from "@/utils/types";
import {
  alliance_earnings_table,
  alliance_member_table,
  alliance_referral_link_table,
  package_table,
  user_table,
} from "@prisma/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "../ui/carousel";
import TableLoading from "../ui/tableLoading";
import DashboardDepositModalDeposit from "./DashboardDepositRequest/DashboardDepositModal/DashboardDepositModalDeposit";
import DashboardDepositModalPackages from "./DashboardDepositRequest/DashboardDepositModal/DashboardDepositPackagesModal";
import DashboardDepositProfile from "./DashboardDepositRequest/DashboardDepositModal/DashboardDepositProfile";
import DashboardDepositModalRefer from "./DashboardDepositRequest/DashboardDepositModal/DashboardDepositRefer";
import DashboardTransactionHistory from "./DashboardDepositRequest/DashboardDepositModal/DashboardTransactionHistory";
import DashboardPackages from "./DashboardPackages";
import DashboardWithdrawModalWithdraw from "./DashboardWithdrawRequest/DashboardWithdrawModal/DashboardWithdrawModalWithdraw";

type Props = {
  earnings: alliance_earnings_table;
  teamMemberProfile: alliance_member_table;
  referal: alliance_referral_link_table;
  packages: package_table[];
  profile: user_table;
  sponsor: string;
};

const DashboardPage = ({
  earnings: initialEarnings,
  referal,
  teamMemberProfile,
  packages,
  profile,
  sponsor,
}: Props) => {
  const supabaseClient = createClientSide();

  const [chartData, setChartData] = useState<ChartDataMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [earnings, setEarnings] = useState<alliance_earnings_table | null>(
    initialEarnings
  );
  const [isActive, setIsActive] = useState(
    teamMemberProfile.alliance_member_is_active
  );
  const [activeSlide, setActiveSlide] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState<DashboardEarnings | null>(
    null
  );

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const getDasboardEarningsData = async () => {
    try {
      const dashboardEarnings = await getDashboardEarnings(supabaseClient, {
        teamMemberId: teamMemberProfile.alliance_member_id,
      });

      setTotalEarnings(dashboardEarnings);
    } catch (e) {
      if (e instanceof Error) {
        await logError(supabaseClient, {
          errorMessage: e.message,
        });
      }
    }
  };

  const getPackagesData = async () => {
    try {
      setIsLoading(true);
      const { data } = await getDashboard(supabaseClient, {
        teamMemberId: teamMemberProfile.alliance_member_id,
      });
      setChartData(data);

      await getDasboardEarningsData();

      // if (totalCompletedAmount !== 0) {
      //   setTotalEarnings((prev) => ({
      //     ...prev,
      //     totalEarnings:
      //       Number(prev?.totalEarnings) + Number(totalCompletedAmount),
      //   }));
      // }
    } catch (e) {
      if (e instanceof Error) {
        await logError(supabaseClient, {
          errorMessage: e.message,
          stackTrace: e.stack,
          stackPath: "components/DashboardPage/DashboardPage.tsx",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getPackagesData();
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    setActiveSlide(api.selectedScrollSnap() + 1 - 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
      setActiveSlide(api.selectedScrollSnap() + 1 - 1);
    });
  }, [api]);

  const carouselItems = [
    { label: "Direct Income", value: totalEarnings?.directReferralAmount },
    { label: "Multiple Income", value: totalEarnings?.indirectReferralAmount },
    { label: "Total Earnings", value: totalEarnings?.totalEarnings },
    { label: "Total Withdrawal", value: totalEarnings?.withdrawalAmount },
  ];

  return (
    <div className="relative min-h-screen h-full mx-auto py-4">
      {isLoading && <TableLoading />}

      <div className="w-full space-y-4 md:px-10">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center justify-between gap-2">
            <DashboardDepositProfile
              sponsor={sponsor}
              teamMemberProfile={teamMemberProfile}
              profile={profile}
            />

            <div>
              <p className="text-xs font-medium">{profile.user_username}</p>
              <p className="text-xs">
                {profile.user_first_name} {profile.user_last_name}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Image src="/app-logo.png" alt="logo" width={55} height={55} />
            <div>
              <p className="text-sm font-medium">Balance</p>
              <p className="text-sm">
                {"₱ "}
                {earnings?.alliance_combined_earnings.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 justify-center">
          <div className="flex items-center justify-between">
            <Button className="w-full max-w-[140px] min-w-[120px] h-7">
              {carouselItems[activeSlide]?.label}{" "}
            </Button>
            <Button className="w-full max-w-[120px] h-7 text-white bg-blue-700">
              facebook
            </Button>
          </div>

          <Carousel
            opts={{
              loop: true,
              align: "start",
              slidesToScroll: 1,
            }}
            setApi={setApi}
          >
            <CarouselContent>
              {carouselItems.map((item, index) => (
                <CarouselItem key={index}>
                  <p className="text-3xl font-bold text-center">
                    {"₱ " +
                      (item.value ?? 0).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                  </p>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="flex justify-center items-center gap-2 py-2">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full ${
                  current === index + 1 ? "bg-gray-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4 ">
            <DashboardDepositModalDeposit
              teamMemberProfile={teamMemberProfile}
              className="w-full"
            />
            <DashboardTransactionHistory
              teamMemberProfile={teamMemberProfile}
              referal={referal}
              className="w-full"
            />
          </div>

          <div className="flex flex-col justify-start gap-4 ">
            <DashboardDepositModalRefer
              teamMemberProfile={teamMemberProfile}
              referal={referal}
              isActive={isActive}
              className="w-full"
              totalEarnings={totalEarnings}
            />

            <DashboardWithdrawModalWithdraw
              teamMemberProfile={teamMemberProfile}
              earnings={earnings}
              setEarnings={setEarnings}
            />
          </div>

          {/* <CardAmount
            title="Total Earnings"
            value={
              Number(totalEarnings.totalEarnings).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) as unknown as number
            }
            description={
              <>
                <DashboardPackageRequest
                  teamMemberProfile={teamMemberProfile}
                />
              </>
            }
            descriptionClassName="text-sm text-green-600"
          />
          <CardAmount
            title="Total Withdraw"
            value={
              Number(
                totalEarnings.withdrawalAmount
              ).toLocaleString() as unknown as number
            }
            description=""
            descriptionClassName="text-sm text-gray-500"
          />
          <CardAmount
            title="Direct Referral"
            value={
              Number(totalEarnings.directReferralAmount).toLocaleString(
                "en-US",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              ) as unknown as number
            }
            description={
              <>
                <Button
                  size={"sm"}
                  onClick={() => router.push("/direct-referral")}
                >
                  Direct Referral
                </Button>
              </>
            }
            descriptionClassName="text-sm text-green-600"
          /> */}
        </div>

        <DashboardDepositModalPackages
          packages={packages}
          earnings={earnings}
          setEarnings={setEarnings}
          setChartData={setChartData}
          setIsActive={setIsActive}
          teamMemberProfile={teamMemberProfile}
          className="w-full"
        />

        {chartData.length > 0 && (
          <div className=" gap-6">
            <DashboardPackages
              chartData={chartData}
              setChartData={setChartData}
              setEarnings={setEarnings}
              setTotalEarnings={setTotalEarnings}
            />
          </div>
        )}

        {/* <div className="w-full flex flex-col lg:flex-row space-6 gap-6">
          <DashboardDepositRequest
            setChartData={setChartData}
            earnings={earnings}
            setEarnings={setEarnings}
            packages={packages}
            setIsActive={setIsActive}
            teamMemberProfile={teamMemberProfile}
          />
          <DashboardWithdrawRequest
            earnings={earnings}
            teamMemberProfile={teamMemberProfile}
          />
        </div> */}
      </div>
    </div>
  );
};

export default DashboardPage;
