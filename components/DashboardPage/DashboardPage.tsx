"use client";

import { logError } from "@/services/Error/ErrorLogs";
import { getUserEarnings } from "@/services/User/User";
import { useUserLoadingStore } from "@/store/useLoadingStore";
import { usePackageChartData } from "@/store/usePackageChartData";
import { useSponsorStore } from "@/store/useSponsortStore";
import { useUserDashboardEarningsStore } from "@/store/useUserDashboardEarnings";
import { useUserEarningsStore } from "@/store/useUserEarningsStore";
import { createClientSide } from "@/utils/supabase/client";
import {
  alliance_member_table,
  alliance_referral_link_table,
  package_table,
  user_table,
} from "@prisma/client";
import { RefreshCw } from "lucide-react";
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
import DashboardEarningsModal from "./DashboardDepositRequest/EarningsModal/EarningsModal";
import DashboardPackages from "./DashboardPackages";
import DashboardWithdrawModalWithdraw from "./DashboardWithdrawRequest/DashboardWithdrawModal/DashboardWithdrawModalWithdraw";

type Props = {
  teamMemberProfile: alliance_member_table;
  referal: alliance_referral_link_table;
  packages: package_table[];
  profile: user_table;
};

const DashboardPage = ({
  referal,
  teamMemberProfile,
  packages,
  profile,
}: Props) => {
  const supabaseClient = createClientSide();
  const { loading } = useUserLoadingStore();
  const { earnings, setEarnings } = useUserEarningsStore();
  const { totalEarnings, setTotalEarnings } = useUserDashboardEarningsStore();
  const { chartData } = usePackageChartData();
  const { sponsor } = useSponsorStore();

  const [isActive, setIsActive] = useState(
    teamMemberProfile.alliance_member_is_active
  );
  const [activeSlide, setActiveSlide] = useState(0);
  const [open, setOpen] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [refresh, setRefresh] = useState(false);

  const handleRefresh = async () => {
    try {
      setRefresh(true);
      const { totalEarnings, userEarningsData } = await getUserEarnings({
        memberId: teamMemberProfile.alliance_member_id,
      });

      if (!totalEarnings || !userEarningsData) return;

      setTotalEarnings({
        directReferralAmount: totalEarnings.directReferralAmount ?? 0,
        indirectReferralAmount: totalEarnings.indirectReferralAmount ?? 0,
        totalEarnings: totalEarnings.totalEarnings ?? 0,
        withdrawalAmount: totalEarnings.withdrawalAmount ?? 0,
        directReferralCount: totalEarnings.directReferralCount ?? 0,
        indirectReferralCount: totalEarnings.indirectReferralCount ?? 0,
      });

      setEarnings(userEarningsData);
    } catch (e) {
      if (e instanceof Error) {
        await logError(supabaseClient, {
          errorMessage: e.message,
        });
      }
    } finally {
      setRefresh(false);
    }
  };

  useEffect(() => {
    if (!api) {
      return;
    }

    setActiveSlide(api.selectedScrollSnap() + 1 - 1);

    api.on("select", () => {
      setActiveSlide(api.selectedScrollSnap() + 1 - 1);
    });
  }, [api]);

  const carouselItems = [
    { label: "Total Earnings", value: totalEarnings?.totalEarnings },
    { label: "Total Withdrawal", value: totalEarnings?.withdrawalAmount },
    { label: "Direct Income", value: totalEarnings?.directReferralAmount },
    { label: "Multiple Income", value: totalEarnings?.indirectReferralAmount },
  ];

  return (
    <div className="relative min-h-screen h-full mx-auto py-4">
      {loading && <TableLoading />}

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
            <Image
              src="/app-logo.png"
              alt="logo"
              width={55}
              height={55}
              priority
            />
            <div>
              <p className="text-sm font-medium">Balance</p>
              {refresh ? (
                <div className="flex space-x-2 justify-center items-center pt-4">
                  {/* Loader circles */}
                  <p className="h-1 w-2 bg-cardColor rounded-full animate-bounce [animation-delay:-0.3s]"></p>
                  <p className="h-1 w-2 bg-cardColor rounded-full animate-bounce [animation-delay:-0.15s]"></p>
                  <p className="h-1 w-2 bg-cardColor rounded-full animate-bounce"></p>
                </div>
              ) : (
                <p className="text-sm">
                  {"₱ "}
                  {earnings?.alliance_combined_earnings
                    ? earnings.alliance_combined_earnings.toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )
                    : 0}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 justify-center">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DashboardEarningsModal />
              <Button
                disabled={refresh}
                className="h-7 px-2"
                onClick={handleRefresh}
              >
                <RefreshCw />
              </Button>
            </div>
            <Button
              onClick={() =>
                window.open(
                  "https://www.facebook.com/groups/pr1meofficialgroup/",
                  "_blank"
                )
              }
              className="w-full max-w-[120px] h-7 text-white bg-blue-700"
            >
              facebook
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-4">
            {/* Left Button */}
            <button
              onClick={() => api?.scrollPrev()} // Hook this up to your carousel
              className="w-0 h-0 border-y-[10px] border-y-transparent border-r-[12px] border-r-white hover:border-r-gray-500 cursor-pointer"
            ></button>

            <Carousel
              opts={{
                loop: true,
                align: "start",
              }}
              setApi={setApi}
              className="w-56 flex justify-center items-center  text-center"
            >
              <CarouselContent>
                {carouselItems.map((item, index) => (
                  <CarouselItem
                    key={index}
                    className="w-full min-w-24 flex justify-center items-center max-w-full "
                  >
                    <div className="text-3xl font-bold text-center">
                      {refresh ? (
                        <div className="flex space-x-2 justify-center items-center pt-4">
                          <p className="h-4 w-4 bg-cardColor rounded-full animate-bounce [animation-delay:-0.3s]"></p>
                          <p className="h-4 w-4 bg-cardColor rounded-full animate-bounce [animation-delay:-0.15s]"></p>
                          <p className="h-4 w-4 bg-cardColor rounded-full animate-bounce"></p>
                        </div>
                      ) : (
                        "₱ " +
                        (item.value ?? 0).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* Right Button */}
            <button
              onClick={() => api?.scrollNext()} // Hook this up to your carousel
              className="w-0 h-0 border-y-[10px] border-y-transparent border-l-[12px] border-l-white hover:border-l-gray-500 cursor-pointer"
            ></button>
          </div>
          <div className="flex justify-center items-center gap-2 py-2">
            <Button className="w-full max-w-[140px] min-w-[120px] h-7">
              {carouselItems[activeSlide]?.label}{" "}
            </Button>
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
              open={open}
              setOpen={setOpen}
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
              setTransactionOpen={setOpen}
              teamMemberProfile={teamMemberProfile}
              earnings={earnings}
            />
          </div>
        </div>

        <DashboardDepositModalPackages
          packages={packages}
          earnings={earnings}
          setIsActive={setIsActive}
          teamMemberProfile={teamMemberProfile}
          className="w-full"
        />

        {chartData.length > 0 && (
          <div className=" gap-6">
            <DashboardPackages teamMemberProfile={teamMemberProfile} />
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
