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
import { AlertCircle, Loader2 } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import PackageCard from "../ui/packageCard";

type Props = {
  earnings: alliance_earnings_table;
  pkg: package_table;
  teamMemberProfile: alliance_member_table;
  setEarnings: Dispatch<SetStateAction<alliance_earnings_table>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const AvailPackagePage = ({
  earnings,
  pkg,
  teamMemberProfile,
  setEarnings,
  setOpen,
}: Props) => {
  const { toast } = useToast();
  const [maxAmount, setMaxAmount] = useState(earnings.alliance_olympus_wallet);

  const formattedMaxAmount = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(maxAmount);

  const formSchema = z.object({
    amount: z
      .string()
      .min(1, "Amount is required")
      .refine((val) => !isNaN(Number(val)), {
        message: "Amount must be a number",
      })
      .refine((val) => Number(val) <= maxAmount, {
        message: `Amount cannot exceed ${formattedMaxAmount}`,
      }),
    packageId: z.string(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      packageId: pkg.package_id,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const result = escapeFormData({ ...data, amount: Number(data.amount) });

      await createPackageConnection({
        packageData: result,
        teamMemberId: teamMemberProfile.alliance_member_id,
      });

      toast({
        title: "Package Enrolled",
        description: "You have successfully enrolled in a package",
        variant: "success",
      });

      reset({ amount: "", packageId: pkg.package_id });

      setEarnings((prev) => ({
        ...prev,
        alliance_olympus_wallet: prev.alliance_olympus_wallet - result.amount,
      }));

      setMaxAmount((prev) => prev - result.amount);
      setOpen(false);
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

  const amount = watch("amount");
  const computation = amount
    ? (Number(amount) * pkg.package_percentage) / 100
    : 0;
  const sumOfTotal = maxAmount + computation;

  return (
    <div className="flex flex-col">
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
            {maxAmount !== 0 && (
              <div className="text-right mb-2">
                <div className="text-right mb-2">
                  <span className="font-medium">Maximum Amount:</span>{" "}
                  <span>{formattedMaxAmount}</span>
                </div>
                <span className="font-medium">Computation:</span>{" "}
                <span>
                  {sumOfTotal.toLocaleString()} in {pkg.packages_days}{" "}
                  {pkg.packages_days === 1 ? "day" : "days"}
                </span>
              </div>
            )}
            {maxAmount !== 0 ? (
              <div>
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
                      type="text"
                      placeholder="Enter amount"
                      {...field}
                      className="w-full border border-gray-300 rounded-lg shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                      value={field.value}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, "");

                        if (value.startsWith("0")) {
                          value = value.replace(/^0+/, "");
                        }

                        field.onChange(value);
                      }}
                    />
                  )}
                />

                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.amount.message}
                  </p>
                )}
                <div>
                  <Button
                    disabled={isSubmitting || maxAmount === 0}
                    type="submit"
                    className="w-full py-3 rounded-lg"
                  >
                    {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                    Avail Package
                  </Button>
                </div>
              </div>
            ) : (
              <Alert>
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
