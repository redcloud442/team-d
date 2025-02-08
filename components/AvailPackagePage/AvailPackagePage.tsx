"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createPackageConnection } from "@/services/Package/Member";
import { usePackageChartData } from "@/store/usePackageChartData";
import { useUserTransactionHistoryStore } from "@/store/useTransactionStore";
import { useUserEarningsStore } from "@/store/useUserEarningsStore";
import { escapeFormData } from "@/utils/function";
import { createClientSide } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  alliance_earnings_table,
  alliance_member_table,
  package_table,
} from "@prisma/client";
import { AlertCircle, Loader2 } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import * as z from "zod";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

type Props = {
  earnings: alliance_earnings_table | null;
  pkg: package_table | [];
  teamMemberProfile: alliance_member_table;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedPackage: Dispatch<SetStateAction<package_table | null>>;
  selectedPackage: package_table | null;
};

const AvailPackagePage = ({
  earnings,
  pkg,
  teamMemberProfile,
  setOpen,
  setSelectedPackage,
  selectedPackage,
}: Props) => {
  const supabaseClient = createClientSide();
  const { toast } = useToast();
  const { setEarnings } = useUserEarningsStore();
  const { chartData, setChartData } = usePackageChartData();
  const { setAddTransactionHistory } = useUserTransactionHistoryStore();
  const [maxAmount, setMaxAmount] = useState(
    earnings?.alliance_combined_earnings ?? 0
  );

  const formattedMaxAmount = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(maxAmount);

  const formSchema = z.object({
    amount: z
      .string()
      .min(3, "Minimum amount is 100 pesos")
      .refine((val) => Number(val) >= 100, {
        message: "Minimum amount is 100 pesos",
      })
      .refine((val) => parseFloat(val) <= parseFloat(maxAmount.toFixed(2)), {
        message: `Amount cannot exceed ${formattedMaxAmount}`,
      }),
    packageId: z.string(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      packageId: selectedPackage?.package_id || "",
    },
  });

  const amount = watch("amount");
  const computation = amount
    ? (Number(amount) * (selectedPackage?.package_percentage ?? 0)) / 100
    : 0;
  const sumOfTotal = Number(amount) + computation;

  const onSubmit = async (data: FormValues) => {
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
        teamMemberId: teamMemberProfile.alliance_member_id,
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
          earnings.alliance_olympus_earnings
        );
        remainingAmount -= olympusDeduction;

        const referralDeduction = Math.min(
          remainingAmount,
          earnings.alliance_referral_bounty
        );
        remainingAmount -= referralDeduction;

        setEarnings({
          ...earnings,
          alliance_combined_earnings:
            earnings.alliance_combined_earnings - Number(result.amount),
          alliance_olympus_earnings:
            earnings.alliance_olympus_earnings - olympusDeduction,
          alliance_referral_bounty:
            earnings.alliance_referral_bounty - referralDeduction,
        });
      }

      setMaxAmount((prev) => prev - result.amount);

      setChartData([
        {
          package: selectedPackage?.package_name || "",
          completion: 0,
          completion_date: completionDate.toISOString(),
          amount: Number(amount),
          is_ready_to_claim: false,
          package_connection_id: uuidv4(),
          profit_amount: Number(computation),
          package_color: selectedPackage?.package_color || "",
          package_date_created: new Date().toISOString(),
          package_member_id: teamMemberProfile?.alliance_member_id,
          package_days: Number(selectedPackage?.packages_days || 0),
          current_amount: Number(amount),
          currentPercentage: Number(0),
        },
        ...chartData,
      ]);

      setAddTransactionHistory({
        data: [
          {
            transaction_id: uuidv4(),
            transaction_date: new Date(),
            transaction_description: `Package Enrolled: ${selectedPackage?.package_name}`,
            transaction_details: "",
            transaction_member_id: teamMemberProfile?.alliance_member_id ?? "",
            transaction_amount: Number(result.amount),
            transaction_attachment: "",
          },
        ],
        count: 1,
      });

      setSelectedPackage(null);
      setOpen(false);
    } catch (e) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-1 gap-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            {maxAmount !== 0 ? (
              <div className="flex flex-col gap-2 p-2">
                <div className="flex items-center justify-around ">
                  <div className="flex flex-col items-center justify-center gap-2 w-36">
                    <label className="font-bold" htmlFor="Profit">
                      Profit Percentage
                    </label>
                    <Input
                      variant="default"
                      id="Profit"
                      type="text"
                      readOnly
                      className="text-center"
                      placeholder="Enter amount"
                      value={`${selectedPackage?.package_percentage ?? 0} %`}
                    />
                  </div>
                  <div className="flex flex-col items-center justify-center gap-2 w-32">
                    <label className="font-bold" htmlFor="Days">
                      No. Days
                    </label>
                    <Input
                      variant="default"
                      id="Days"
                      type="text"
                      className="text-center"
                      value={Number(selectedPackage?.packages_days) || ""}
                      readOnly
                    />
                  </div>
                </div>
                {/* amount to avail */}
                <div className="flex gap-2 justify-between items-end">
                  <div>
                    <label className="font-bold text-center" htmlFor="amount">
                      Amount to avail
                    </label>
                    <Controller
                      name="amount"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="amount"
                          type="text"
                          placeholder="Enter amount"
                          {...field}
                          className="w-full border border-gray-300 rounded-lg shadow-xs px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
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

                            const amount = maxAmount;

                            // Enforce the maximum amount value
                            const numericValue = parseFloat(value || "0");
                            if (!isNaN(numericValue) && numericValue > amount) {
                              value = amount.toString(); // Adjust precision to match allowed decimals
                            }

                            field.onChange(value);
                          }}
                        />
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      setValue("amount", maxAmount.toFixed(2));
                    }}
                    className="h-12 bg-pageColor text-white"
                  >
                    Max
                  </Button>
                </div>

                {errors.amount && (
                  <p className="text-primaryRed text-sm">
                    {errors.amount.message}
                  </p>
                )}
                {/* no. days */}
                <div className="flex flex-col gap-2 w-full">
                  <label className="font-bold" htmlFor="Maturity">
                    Maturity Income
                  </label>
                  <Input
                    variant="default"
                    id="Maturity"
                    readOnly
                    type="text"
                    className="text-center"
                    placeholder="Enter amount"
                    value={computation.toLocaleString() || ""}
                  />
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <label className="font-bold" htmlFor="Gross">
                    Total Gross
                  </label>
                  <Input
                    variant="default"
                    id="Gross"
                    readOnly
                    type="text"
                    className="text-center"
                    placeholder="Gross Income"
                    value={
                      sumOfTotal.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }) || ""
                    }
                  />
                </div>
                <p className="text-sm font-bold text-primaryRed">
                  {"Tip: You can Maximize your earnings with Multiple Plan."}
                </p>
                <div className="flex items-center justify-center">
                  <Button
                    disabled={isSubmitting || maxAmount === 0}
                    type="submit"
                    className="py-5 rounded-xl   bg-pageColor text-white"
                  >
                    {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                    Submit
                  </Button>
                </div>
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Balance</AlertTitle>
                <AlertDescription>
                  You don&apos;t have enough balance to avail a package.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AvailPackagePage;
