"use client";

import { revalidateCache } from "@/app/action/action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createPackageConnection } from "@/services/Package/Member";
import { usePackageChartData } from "@/store/usePackageChartData";
import { useUserEarningsStore } from "@/store/useUserEarningsStore";
import { packageMap } from "@/utils/constant";
import { useRole } from "@/utils/context/roleContext";
import { escapeFormData, formatNumberLocale } from "@/utils/function";
import { PromoPackageSchema } from "@/utils/schema";
import { package_table, PurchaseSummary } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Label } from "../ui/label";

type Props = {
  selectedPackage: package_table;
  packagePurchaseSummary: PurchaseSummary;
  setSummary: Dispatch<SetStateAction<PurchaseSummary>>;
  setSelectedPackage: Dispatch<SetStateAction<package_table | null>>;
};

const AvailPackagePage = ({
  selectedPackage,
  packagePurchaseSummary,
  setSummary,
  setSelectedPackage,
}: Props) => {
  const queryClient = useQueryClient();

  const { teamMemberProfile, setTeamMemberProfile } = useRole();
  const { toast } = useToast();
  const { earnings, setEarnings } = useUserEarningsStore();
  const { chartData, setChartData } = usePackageChartData();

  const [maxAmount, setMaxAmount] = useState(
    earnings?.company_combined_earnings
  );

  const packageSchema = PromoPackageSchema(
    maxAmount ?? 0,
    selectedPackage?.package_maximum_amount
  );

  const form = useForm<z.infer<typeof packageSchema>>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      amount: "",
      packageId: "",
    },
  });

  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { isSubmitting },
  } = form;

  const amount = watch("amount");

  const computation = amount
    ? (Number(amount) * (selectedPackage?.package_percentage ?? 0)) / 100
    : 0;

  const onSubmit = async (data: z.infer<typeof packageSchema>) => {
    try {
      if (
        packagePurchaseSummary[
          packageMap[selectedPackage.package_name as keyof typeof packageMap]
        ] >= (selectedPackage.package_limit ?? 0)
      ) {
        toast({
          title: "Error",
          description: "You have already purchased this package.",
          variant: "destructive",
        });
        return;
      }

      const result = escapeFormData({ ...data, amount: Number(data.amount) });
      const now = new Date();
      const completionDate = new Date(
        now.getTime() +
          (selectedPackage?.packages_days ?? 0) * 24 * 60 * 60 * 1000
      );

      await createPackageConnection({
        packageData: {
          amount: Number(result.amount),
          packageId: selectedPackage?.package_id || "",
        },
        teamMemberId: teamMemberProfile.company_member_id,
      });

      toast({
        title: "Subscription Success",
        description: "You will be redirected shortly",
      });

      reset({ amount: "", packageId: selectedPackage?.package_id || "" });

      if (earnings) {
        let remainingAmount = Number(result.amount);

        const olympusDeduction = Math.min(
          remainingAmount,
          earnings.company_package_earnings
        );
        remainingAmount -= olympusDeduction;

        const referralDeduction = Math.min(
          remainingAmount,
          earnings.company_referral_earnings
        );
        remainingAmount -= referralDeduction;

        setEarnings({
          ...earnings,
          company_combined_earnings:
            earnings.company_combined_earnings - Number(result.amount),
          company_package_earnings:
            earnings.company_package_earnings - olympusDeduction,
          company_referral_earnings:
            earnings.company_referral_earnings - referralDeduction,
        });
      }

      setMaxAmount((prev) => (prev ?? 0) - result.amount);

      setChartData([
        {
          package: selectedPackage?.package_name || "",
          completion: 0,
          completion_date: completionDate.toISOString(),
          amount: Number(amount),
          is_ready_to_claim: false,
          package_connection_id: uuidv4(),
          profit_amount: Number(computation),
          package_date_created: new Date().toISOString(),
          package_member_id: teamMemberProfile?.company_member_id,
          package_days: Number(selectedPackage?.packages_days || 0),
          package_days_remaining: Number(selectedPackage?.packages_days || 0),
          current_amount: 0,
          currentPercentage: Number(0),
          package_percentage: Number(selectedPackage?.package_percentage || 0),
          package_image: selectedPackage?.package_image || "",
          package_is_highlight: selectedPackage?.package_is_highlight || false,
        },
        ...chartData,
      ]);

      if (!teamMemberProfile.company_member_is_active) {
        setTeamMemberProfile((prev) => ({
          ...prev,
          company_member_is_active: true,
        }));
      }

      setSummary({
        ...packagePurchaseSummary,
        [packageMap[selectedPackage.package_name as keyof typeof packageMap]]:
          (packagePurchaseSummary[
            packageMap[selectedPackage.package_name as keyof typeof packageMap]
          ] as number) + 1,
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      queryClient.invalidateQueries({
        queryKey: [
          "transaction-history",
          "PACKAGE",
          teamMemberProfile?.company_member_id,
        ],
      });
      setSelectedPackage(null);
      revalidateCache({ path: "packages" });
    }
  };

  return (
    <div className="flex flex-col justify-center gap-4 w-full">
      <div className="flex flex-col gap-4 p-2 border-bg-primary-blue">
        <div className="flex justify-center w-full gap-4">
          <div className="relative flex flex-col justify-center items-center w-full gap-2 sm:w-[180px] flex-1 sm:flex-none">
            <Image
              src={selectedPackage.package_image || ""}
              alt={selectedPackage.package_name}
              width={200}
              height={200}
              priority
              className="rounded-lg border-2 cursor-pointer object-contain hover:scale-105 duration-300 transition-transform duration-200 active:scale-95"
            />
          </div>
        </div>
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 w-full mx-auto flex justify-center items-center"
          >
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <FormField
                control={control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-start font-normal text-xl">
                      Amount
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="amount"
                        type="text"
                        variant="non-card"
                        className="text-start text-2xl bg-teal-500 text-white dark:placeholder:text-white font-normal border-none h-14"
                        placeholder="Enter Amount"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          let value = e.target.value;

                          if (value === "") {
                            field.onChange("");
                            return;
                          }

                          // Allow only numbers and a single decimal point
                          value = value.replace(/[^0-9]/g, "");

                          // Prevent multiple decimal points
                          const parts = value.split(".");
                          if (parts.length > 2) {
                            value = parts[0] + "." + parts[1]; // Keep only the first decimal part
                          }

                          // Ensure it doesn't start with multiple zeros (e.g., "00")
                          if (
                            value.startsWith("0") &&
                            !value.startsWith("0.")
                          ) {
                            value = value.replace(/^0+/, "0");
                          }

                          // Limit decimal places to 2 (adjust as needed)
                          if (value.includes(".")) {
                            const [integerPart, decimalPart] = value.split(".");
                            value = `${integerPart}.${decimalPart.slice(0, 2)}`;
                          }

                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Label
                className="text-start font-normal text-xl"
                htmlFor="totalIncome"
              >
                Earn
              </Label>
              <Input
                variant="non-card"
                id="totalIncome"
                readOnly
                type="text"
                className="text-start text-2xl bg-teal-500 text-white dark:placeholder:text-white font-normal border-none h-14"
                placeholder="Total Income"
                value={formatNumberLocale(computation) || ""}
              />

              <Label
                className="text-start font-normal text-xl"
                htmlFor="totalIncome"
              >
                TOTAL
              </Label>
              <Input
                variant="non-card"
                id="totalIncome"
                readOnly
                type="text"
                className="text-start text-2xl bg-teal-500 text-white dark:placeholder:text-white font-normal border-none h-14"
                placeholder="Total Income"
                value={formatNumberLocale(Number(amount) + computation) || ""}
              />

              <div className="flex items-center justify-center pt-4">
                <Button
                  className=" font-black text-2xl p-5"
                  disabled={isSubmitting || Number(maxAmount) <= 0}
                  type="submit"
                >
                  {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                  Submit
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AvailPackagePage;
