"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { escapeFormData } from "@/utils/function";
import { zodResolver } from "@hookform/resolvers/zod";
import { package_table } from "@prisma/client";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { Card } from "../ui/card";
import PackageCard from "../ui/packageCard";
import PackageDescription from "../ui/packageDescription";

const formSchema = z.object({
  amount: z
    .string({ invalid_type_error: "Amount must be a number" })
    .max(1000000, "Maximum amount is 10,000")
    .min(1, "Minimum amount is 1"),
  packageId: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  pkg: package_table;
};

const AvailPackagePage = ({ pkg }: Props) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      packageId: pkg.package_id,
    },
  });

  const onSubmit = (data: FormValues) => {
    try {
      const result = escapeFormData(data);
      console.log(result);
    } catch (e) {
      console.log(e);
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
            <Button type="submit" className="w-full  py-3 rounded-lg">
              ENTER
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AvailPackagePage;
