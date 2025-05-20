"use client";

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
import { ArrowLeft, CrownIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
};

const AvailPackagePage = ({ selectedPackage }: Props) => {
  const { teamMemberProfile, setTeamMemberProfile } = useRole();
  const { toast } = useToast();
  const { earnings, setEarnings } = useUserEarningsStore();
  const { chartData, setChartData } = usePackageChartData();

  const [maxAmount, setMaxAmount] = useState(
    earnings?.company_combined_earnings
  );

  const packageSchema = PromoPackageSchema(
    maxAmount ?? 0,
    selectedPackage?.package_minimum_amount
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
  const sumOfTotal = Number(amount) + computation;

  const onSubmit = async (data: z.infer<typeof packageSchema>) => {
    try {
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
        title: "Enrolled Package",
        description: "You have successfully enrolled in a package",
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
          current_amount: Number(amount),
          currentPercentage: Number(0),
          package_percentage: Number(selectedPackage?.package_percentage || 0),
          package_image: selectedPackage?.package_image || "",
        },
        ...chartData,
      ]);

      setTeamMemberProfile((prev) => ({
        ...prev,
        company_member_is_active: false,
      }));
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
            {selectedPackage.package_features_table.map((feature, index) => {
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
                    <span className="text-bg-primary-blue font-bold">✓</span>
                    <span
                      className="text-white"
                      dangerouslySetInnerHTML={{ __html: highlighted }}
                    />
                  </li>
                );
              });
            })}
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
                        if (value.startsWith("0") && !value.startsWith("0.")) {
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
              value={formatNumberLocale(sumOfTotal) || ""}
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
  );
};

export default AvailPackagePage;
