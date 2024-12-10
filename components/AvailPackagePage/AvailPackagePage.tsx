"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createPackageConnection } from "@/services/Package/Member";
import { escapeFormData } from "@/utils/function";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import PackageCard from "../ui/packageCard";
import PackageDescription from "../ui/packageDescription";

import {
  alliance_earnings_table,
  alliance_member_table,
  package_table,
} from "@prisma/client";

type Props = {
  earnings: alliance_earnings_table;
  pkg: package_table;
  teamMemberProfile: alliance_member_table;
  setEarnings: Dispatch<SetStateAction<alliance_earnings_table>>;
};

const AvailPackagePage = ({
  earnings,
  pkg,
  teamMemberProfile,
  setEarnings,
}: Props) => {
  const { toast } = useToast();
  const [maxAmount, setMaxAmount] = useState(earnings.alliance_olympus_wallet);

  const formattedMaxAmount = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(maxAmount);

  const formSchema = z.object({
    amount: z
      .number({ invalid_type_error: "Amount must be a number" })
      .max(maxAmount, `You don't have enough balance`)
      .min(1, "Minimum amount is 1"),
    packageId: z.string(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const {
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 1,
      packageId: pkg.package_id,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const result = escapeFormData(data);
      await createPackageConnection({
        packageData: result,
        teamMemberId: teamMemberProfile.alliance_member_id,
      });

      toast({
        title: "Package Enrolled",
        description: "You have successfully enrolled in a package",
        variant: "success",
      });

      reset({
        amount: 1,
        packageId: pkg.package_id,
      });

      setEarnings((prev) => ({
        ...prev,
        alliance_olympus_wallet: prev.alliance_olympus_wallet - result.amount,
      }));
      setMaxAmount((prev) => prev - result.amount);
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "An unexpected error occurred.";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleAmountChange = (value: string) => {
    if (value.startsWith("0")) return;
    const numericValue = Number(value);

    if (!isNaN(numericValue) && numericValue >= 1) {
      setValue("amount", numericValue, { shouldValidate: true });
    }
  };
  const amount = watch("amount");
  const computation = (Number(amount) * pkg.package_percentage) / 100;

  const sumOfTotal = maxAmount + computation;

  return (
    <div className="flex flex-col">
      <PackageDescription />
      <div className="grid grid-cols-1 gap-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <PackageCard
            key={pkg.package_id}
            packageName={pkg.package_name}
            packageDescription={pkg.package_description}
            packagePercentage={`${pkg.package_percentage} %`}
            packageDays={String(pkg.packages_days)}
          />

          <div>
            <div className="text-right mb-2">
              <span className="font-medium">Maximum Amount:</span>{" "}
              <span>{formattedMaxAmount}</span>
            </div>
            <div className="text-right mb-2">
              <span className="font-medium">Computation:</span>{" "}
              <span>
                {sumOfTotal} in {pkg.packages_days}{" "}
                {pkg.packages_days === 1 ? "day" : "days"}
              </span>
            </div>

            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter the amount to invest:
            </label>

            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  {...field}
                  className="w-full border border-gray-300 rounded-lg shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                  min={1}
                  max={maxAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                />
              )}
            />

            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div>
            <Button
              disabled={isSubmitting}
              type="submit"
              className="w-full py-3 rounded-lg"
            >
              {isSubmitting && <Loader className="animate-spin mr-2" />}
              Avail Package
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AvailPackagePage;
