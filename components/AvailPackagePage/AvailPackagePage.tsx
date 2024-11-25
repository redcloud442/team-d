"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createPackageConnection } from "@/services/Package/Member";
import { escapeFormData } from "@/utils/function";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  alliance_earnings_table,
  alliance_member_table,
  package_table,
} from "@prisma/client";
import { Loader } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { Card } from "../ui/card";
import PackageCard from "../ui/packageCard";
import PackageDescription from "../ui/packageDescription";
type Props = {
  earnings: alliance_earnings_table;
  pkg: package_table;
  teamMemberProfile: alliance_member_table;
};
const AvailPackagePage = ({ earnings, pkg, teamMemberProfile }: Props) => {
  const { toast } = useToast();

  const [maxAmount, setMaxAmount] = useState(earnings.alliance_olympus_wallet);

  const formattedMaxAmount = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(maxAmount);

  const formSchema = z.object({
    amount: z
      .number({ invalid_type_error: "Amount must be a number" })
      .max(maxAmount, `Maximum amount is ${formattedMaxAmount}`)
      .min(1, "Minimum amount is 1"),
    packageId: z.string(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const {
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
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
        amount: undefined,
        packageId: pkg.package_id,
      });
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
    const numericValue = Number(value);

    // If value exceeds max, set to max
    if (numericValue > maxAmount) {
      setValue("amount", maxAmount, { shouldValidate: true });
    } else {
      setValue("amount", numericValue, { shouldValidate: true });
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen px-6 py-12">
      <PackageDescription />
      <Card className="grid grid-cols-1 gap-8 max-w-4xl p-10">
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
                  max={maxAmount} // For client-side max validation
                  min={1} // Ensure minimum value
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
              {isSubmitting && <Loader className="animate-spin" />}
              ENTER
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AvailPackagePage;
