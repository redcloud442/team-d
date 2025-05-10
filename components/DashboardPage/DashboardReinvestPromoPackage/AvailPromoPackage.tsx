"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createPromoPackageConnection } from "@/services/Package/Member";
import { usePackageChartData } from "@/store/usePackageChartData";
import { useUserEarningsStore } from "@/store/useUserEarningsStore";
import { useRole } from "@/utils/context/roleContext";
import { escapeFormData, formatNumberLocale } from "@/utils/function";
import { PromoPackageFormValues, PromoPackageSchema } from "@/utils/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { package_table } from "@prisma/client";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";

type Props = {
  onClick: () => void;
  selectedPackage: package_table | null;
};

const AvailPromoPackage = ({ onClick, selectedPackage }: Props) => {
  const { earnings, setEarnings } = useUserEarningsStore();
  const { chartData, setChartData } = usePackageChartData();
  const { toast } = useToast();
  const { teamMemberProfile } = useRole();

  const [open, setOpen] = useState(false);
  const maxReinvestment =
    (earnings?.company_package_earnings ?? 0) +
    (earnings?.company_referral_earnings ?? 0);
  const [maxAmount, setMaxAmount] = useState(maxReinvestment);

  const formattedMaxAmount = formatNumberLocale(maxAmount);

  const formSchema = PromoPackageSchema(maxAmount, formattedMaxAmount);

  const form = useForm<PromoPackageFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      packageId: selectedPackage?.package_id || "",
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
    ? (Number(amount) * Number(selectedPackage?.package_percentage ?? 0)) / 100
    : 0;

  const sumOfTotal = Number(amount) + computation;

  const onSubmit = async (data: PromoPackageFormValues) => {
    try {
      const result = escapeFormData({ ...data, amount: Number(data.amount) });
      const now = new Date();
      const completionDate = new Date(
        now.getTime() +
          Number(selectedPackage?.packages_days ?? 0) * 24 * 60 * 60 * 1000
      );

      const packageConnection = await createPromoPackageConnection({
        packageData: {
          amount: Number(result.amount),
          packageId: selectedPackage?.package_id || "",
        },
        teamMemberId: teamMemberProfile.company_member_id,
      });

      toast({
        title: `Package Enrolled ${selectedPackage?.package_name}`,
        description: "You have successfully enrolled in   a package",
      });

      reset({ amount: "", packageId: selectedPackage?.package_id || "" });

      if (earnings) {
        let remainingAmount = Number(result.amount);

        const olympusDeduction = Math.min(
          remainingAmount,
          Number(earnings.company_package_earnings ?? 0)
        );
        remainingAmount -= olympusDeduction;

        const referralDeduction = Math.min(
          remainingAmount,
          Number(earnings.company_referral_earnings ?? 0)
        );
        remainingAmount -= referralDeduction;

        setEarnings({
          ...earnings,
          company_combined_earnings:
            Number(earnings.company_combined_earnings ?? 0) -
            Number(result.amount),
          company_package_earnings:
            Number(earnings.company_package_earnings ?? 0) -
            Number(olympusDeduction),
          company_referral_earnings:
            Number(earnings.company_referral_earnings ?? 0) -
            Number(referralDeduction),
        });
      }

      setMaxAmount((prev) => Number(prev) - Number(result.amount));

      setChartData([
        {
          package: selectedPackage?.package_name || "",
          completion: 0,
          completion_date: completionDate.toISOString(),
          amount: Number(amount),
          is_ready_to_claim: false,
          package_connection_id:
            packageConnection.package_member_connection_id || "",
          profit_amount: Number(computation),
          package_gif: selectedPackage?.package_gif || "",
          package_date_created: new Date().toISOString(),
          package_percentage: selectedPackage?.package_percentage || 0,
          package_member_id: teamMemberProfile?.company_member_id,
          package_days: Number(selectedPackage?.packages_days || 0),
          current_amount: Number(amount),
          package_image: selectedPackage?.package_image || "",
          currentPercentage: 0,
        },
        ...chartData,
      ]);

      //   setSelectedPackageToNull();
      //   setSelectedPackageToNull();
      //   setPromoPackage(false);
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
          className="absolute right-10 sm:right-10 bottom-10 sm:bottom-10 z-50 text-xl sm:text-4xl p-4 sm:p-6 w-min sm:max-w-xs"
          variant="card"
          onClick={onClick}
        >
          AVAIL
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-orange-950 dark:bg-orange-950">
        <DialogHeader>
          <DialogTitle className="text-center stroke-text-orange">
            {selectedPackage?.package_name}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 px-4 pb-4">
          <Image
            src={selectedPackage?.package_image || ""}
            alt={selectedPackage?.package_name || ""}
            width={1000}
            height={1000}
            unoptimized
          />
        </div>
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
                value={
                  (earnings?.company_package_earnings ?? 0) +
                    (earnings?.company_referral_earnings ?? 0) || ""
                }
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
                  disabled={isSubmitting || maxAmount === 0}
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

export default AvailPromoPackage;
