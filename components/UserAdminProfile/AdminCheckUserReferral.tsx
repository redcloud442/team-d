import { useToast } from "@/hooks/use-toast";
import { UserRequestdata } from "@/utils/types";
import { format } from "date-fns";
import { CalendarIcon, Loader2, PhilippinePeso } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

import { getAdminCheckUserReferral } from "@/services/User/Admin";
import { useState } from "react";
import CardAmountAdmin from "../ui/CardAmountAdmin";
import { Skeleton } from "../ui/skeleton";

type Props = {
  userProfile: UserRequestdata;
};

type DateFilter = {
  dateFilter: {
    start: string;
    end: string;
  };
};

const AdminCheckUserReferral = ({ userProfile }: Props) => {
  const { toast } = useToast();

  const [referralData, setReferralData] = useState<{
    directReferral: number;
    indirectReferral: number;
  } | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<DateFilter>({
    defaultValues: {
      dateFilter: {
        start: "",
        end: "",
      },
    },
  });

  const startDateFilter = watch("dateFilter.start");
  const endDateFilter = watch("dateFilter.end");

  const dateFilter = startDateFilter && endDateFilter;

  const handleFetchAdminDashboardData = async (data: DateFilter) => {
    try {
      const { start, end } = data.dateFilter;
      const referralData = await getAdminCheckUserReferral({
        memberId: userProfile.alliance_member_id,
        dateFilter: {
          start: new Date(start),
          end: new Date(end),
        },
      });
      setReferralData(referralData);
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to fetch referral data",
      });
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className=" border-b pb-4">
        <div className="flex flex-wrap justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 ">
            Check User Referral
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 p-6">
        <form
          onSubmit={handleSubmit(handleFetchAdminDashboardData)}
          className="flex flex-wrap items-center gap-4"
        >
          <Controller
            name="dateFilter.start"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="font-normal flex-1 w-full sm:w-auto justify-start rounded-md"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value
                      ? format(new Date(field.value), "PPP")
                      : "Select Start Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full sm:w-auto p-0">
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
                    className="font-normal flex-1 w-full md:w-auto justify-start rounded-md"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value
                      ? format(new Date(field.value), "PPP")
                      : "Select End Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full md:w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date: Date | undefined) =>
                      field.onChange(date?.toISOString() || "")
                    }
                    fromDate={field.value ? new Date(field.value) : undefined}
                    disabled={(date) =>
                      field.value ? date < new Date(field.value) : false
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          <Button
            className="w-full md:w-auto rounded-md"
            disabled={!dateFilter || isSubmitting}
            type="submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Loading...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </form>

        <div className="flex flex-col gap-4">
          <CardAmountAdmin
            title="Direct Referral"
            value={
              <>
                <PhilippinePeso />{" "}
                {isSubmitting ? (
                  <Skeleton className="w-20 h-7" />
                ) : (
                  (Number(referralData?.directReferral ?? 0).toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  ) ?? 0)
                )}
              </>
            }
            description=""
            descriptionClassName="text-sm text-green-600"
          />
          <CardAmountAdmin
            title="Indirect Referral"
            value={
              <>
                <PhilippinePeso />{" "}
                {isSubmitting ? (
                  <Skeleton className="w-20 h-7" />
                ) : (
                  (Number(referralData?.indirectReferral ?? 0).toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  ) ?? 0)
                )}
              </>
            }
            description=""
            descriptionClassName="text-sm text-green-600"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminCheckUserReferral;
