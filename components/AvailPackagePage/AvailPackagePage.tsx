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
import { zodResolver } from "@hookform/resolvers/zod";
import { package_table } from "@prisma/client";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
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
  onClick: () => void;
  selectedPackage: package_table | null;
};

const AvailPackagePage = ({ onClick, selectedPackage }: Props) => {
  const { teamMemberProfile, setTeamMemberProfile } = useRole();
  const { toast } = useToast();
  const { earnings, setEarnings } = useUserEarningsStore();
  const { chartData, setChartData } = usePackageChartData();

  const [maxAmount, setMaxAmount] = useState(
    earnings?.company_combined_earnings
  );
  const [open, setOpen] = useState(false);

  const formattedMaxAmount = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(maxAmount ?? 0);

  const packageSchema = PromoPackageSchema(maxAmount ?? 0, formattedMaxAmount);

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
          package_gif: selectedPackage?.package_gif || "",
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="absolute right-20 sm:right-32 bottom-10 sm:bottom-20 text-xl sm:text-4xl p-4 sm:p-6 w-min sm:max-w-xs"
          variant="card"
          onClick={onClick}
        >
          AVAIL
        </Button>
      </DialogTrigger>
      <DialogContent
        className="bg-orange-950 dark:bg-orange-950"
        type="earnings"
      >
        <DialogHeader>
          <DialogTitle className="stroke-text-orange">
            {selectedPackage?.package_name}
          </DialogTitle>
        </DialogHeader>
        <Image
          src={selectedPackage?.package_image || ""}
          alt={selectedPackage?.package_name || ""}
          width={1000}
          height={1000}
          unoptimized
        />
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 w-full mx-auto flex justify-center items-center"
          >
            <div className="flex flex-col gap-4 w-full max-w-xs">
              <Label className="font-bold text-center" htmlFor="walletBalance">
                WALLET BALANCE:
              </Label>
              <Input
                variant="non-card"
                id="walletBalance"
                readOnly
                type="text"
                className="text-center"
                placeholder="0"
                value={earnings?.company_combined_earnings || ""}
              />

              <FormField
                control={control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-center">
                      AMOUNT TO AVAIL:
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="amount"
                        type="text"
                        variant="non-card"
                        className="text-center"
                        placeholder="Enter amount"
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

              <Label className="font-bold text-center" htmlFor="totalIncome">
                TOTAL INCOME AFTER {selectedPackage?.packages_days} DAYS
              </Label>
              <Input
                variant="non-card"
                id="totalIncome"
                readOnly
                type="text"
                className="text-center"
                placeholder="Total Income"
                value={formatNumberLocale(sumOfTotal) || ""}
              />

              <div className="flex items-center justify-center">
                <Button
                  variant="card"
                  className=" font-black text-2xl rounded-full p-5"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                  Submit
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AvailPackagePage;
