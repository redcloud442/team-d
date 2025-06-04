"use client";

import { revalidateCache } from "@/app/action/action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createPackageConnection } from "@/services/Package/Member";
import { usePackageChartData } from "@/store/usePackageChartData";
import { useUserEarningsStore } from "@/store/useUserEarningsStore";
import { useRole } from "@/utils/context/roleContext";
import { escapeFormData, formatNumberLocale } from "@/utils/function";
import { PromoPackageSchema } from "@/utils/schema";
import { package_table } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CrownIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  selectedPackage: package_table & {
    package_features_table: {
      package_features_description: { text: string; value: string }[];
    }[];
  };
  packagePurchaseSummary: {
    member_id: string;
    [key: string]: string;
  };
};

const AvailPackagePage = ({
  selectedPackage,
  packagePurchaseSummary,
}: Props) => {
  const router = useRouter();
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
    selectedPackage?.package_minimum_amount,
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
      const result = escapeFormData({ ...data, amount: Number(data.amount) });
      const now = new Date();
      const completionDate = new Date(
        now.getTime() +
          (selectedPackage?.packages_days ?? 0) * 24 * 60 * 60 * 1000
      );

      await Promise.all([
        createPackageConnection({
          packageData: {
            amount: Number(result.amount),
            packageId: selectedPackage?.package_id || "",
          },
          teamMemberId: teamMemberProfile.company_member_id,
        }),
        revalidateCache({ path: "packages" }),
      ]);

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
          current_amount: Number(amount),
          currentPercentage: Number(0),
          package_percentage: Number(selectedPackage?.package_percentage || 0),
          package_image: selectedPackage?.package_image || "",
          package_is_highlight: selectedPackage?.package_is_highlight || false,
        },
        ...chartData,
      ]);

      setTeamMemberProfile((prev) => ({
        ...prev,
        company_member_is_active: false,
      }));

      queryClient.invalidateQueries({
        queryKey: [
          "transaction-history",
          "PACKAGE",
          teamMemberProfile?.company_member_id,
        ],
      });

      setTimeout(() => {
        router.push("/digi-dash");
      }, 1000);
    } catch (e) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col justify-center gap-4 w-full">
      {packagePurchaseSummary ? (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="relative bg-gradient-to-br from-red-50 to-red-100 border-4 border-red-500 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-pulse space-y-4">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="text-center space-y-4">
              <div className="bg-white bg-opacity-70 rounded-xl p-4 border-2 border-red-300">
                <p className="text-red-800 font-semibold text-lg mb-2">
                  PACKAGE LIMIT EXCEEDED
                </p>
                <p className="text-red-600 text-sm">
                  You have reached the maximum purchase limit for this package.
                  Please wait tomorrow to purchase again.
                </p>
              </div>

              <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-3">
                <p className="text-yellow-800 text-sm font-semibold">
                  ⚠️ Limit Reached
                </p>
              </div>
            </div>

            <div className="absolute top-4 right-4 opacity-20">
              <div className="w-8 h-8 border-4 border-red-500 rounded-full animate-spin"></div>
            </div>

            <Link href="/subscription">
              <Button
                variant="outline"
                className="font-black rounded-lg px-4 w-full"
              >
                <ArrowLeft className="text-bg-primary-blue" />
                BACK
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-2 border-bg-primary-blue">
          <div className="flex flex-col items-center gap-2 border-3 p-2 border-bg-primary-blue rounded-full">
            <h1 className="text-2xl font-bold text-bg-primary-blue">
              AVAILABLE BALANCE
            </h1>
            <span className="text-2xl font-black">
              ₱ {formatNumberLocale(earnings?.company_combined_earnings ?? 0)}
            </span>
          </div>
          <div className="flex justify-center w-full gap-4">
            <div className="relative flex flex-col w-full gap-2 sm:w-[180px] flex-1 sm:flex-none">
              <Image
                src={selectedPackage.package_image || ""}
                alt={selectedPackage.package_name}
                width={200}
                height={200}
                priority
                className="rounded-lg border-2 cursor-pointer object-contain hover:scale-105 duration-300 transition-transform duration-200 active:scale-95"
              />
            </div>

            {/* Right: Info */}
            <div className=" text-white flex-1 sm:flex-none">
              <div className="flex flex-col justify-center items-center">
                {selectedPackage.package_is_popular && (
                  <p className="text-[9px] font-semibold">MOST POPULAR</p>
                )}
                {selectedPackage.package_is_highlight && (
                  <p className="text-[9px] font-semibold">
                    <CrownIcon className="text-bg-primary-blue" />
                  </p>
                )}
                <h2 className="text-xl text-bg-primary-blue flex items-center gap-1 uppercase font-black">
                  {selectedPackage.package_name}{" "}
                  {selectedPackage.package_is_popular && (
                    <span className="text-teal-300">★</span>
                  )}
                </h2>
              </div>

              <ul className="mt-2 space-y-1 text-sm">
                {selectedPackage.package_features_table.map(
                  (feature, index) => {
                    const description = feature.package_features_description;

                    return description.map((item, subIndex) => {
                      const highlighted = item.text.replace(
                        item.value,
                        `<span class='text-bg-primary-blue font-bold'>${item.value}</span>`
                      );

                      return (
                        <li
                          key={`${index}-${subIndex}`}
                          className="flex items-start gap-1"
                        >
                          <span className="text-bg-primary-blue font-bold">
                            ✓
                          </span>
                          <span
                            className="text-white"
                            dangerouslySetInnerHTML={{ __html: highlighted }}
                          />
                        </li>
                      );
                    });
                  }
                )}
              </ul>
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
                      <FormLabel className="font-bold text-center text-2xl">
                        INPUT AMOUNT:
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="amount"
                          type="text"
                          variant="non-card"
                          className="text-center text-2xl rounded-full bg-bg-primary-blue text-black dark:placeholder:text-black"
                          placeholder="INPUT AMOUNT"
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
                              const [integerPart, decimalPart] =
                                value.split(".");
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
                  className="font-bold text-center text-2xl"
                  htmlFor="totalIncome"
                >
                  GENERATED PROFIT
                </Label>
                <Input
                  variant="non-card"
                  id="totalIncome"
                  readOnly
                  type="text"
                  className="text-center text-2xl rounded-full bg-bg-primary-blue text-black dark:placeholder:text-black"
                  placeholder="Total Income"
                  value={formatNumberLocale(computation) || ""}
                />

                <Label
                  className="font-bold text-center text-2xl"
                  htmlFor="totalIncome"
                >
                  TOTAL
                </Label>
                <Input
                  variant="non-card"
                  id="totalIncome"
                  readOnly
                  type="text"
                  className="text-center text-2xl rounded-full bg-bg-primary-blue text-black dark:placeholder:text-black"
                  placeholder="Total Income"
                  value={formatNumberLocale(Number(amount) + computation) || ""}
                />

                <div className="flex items-center justify-center pt-4">
                  <Button
                    className=" font-black text-2xl rounded-full p-5"
                    disabled={isSubmitting || Number(maxAmount) <= 0}
                    type="submit"
                  >
                    {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                    SUBMIT
                  </Button>
                </div>
              </div>
            </form>
          </Form>
          <div className="flex justify-end items-end">
            <Link href="/subscription">
              <Button variant="outline" className="font-black rounded-lg px-4">
                <ArrowLeft className="text-bg-primary-blue" />
                BACK
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailPackagePage;
