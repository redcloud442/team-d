"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getUserEarnings } from "@/services/User/User";
import { createWithdrawalRequest } from "@/services/Withdrawal/Member";
import { useUserEarningsStore } from "@/store/useUserEarningsStore";
import { useUserHaveAlreadyWithdraw } from "@/store/useWithdrawalToday";
import { bankData } from "@/utils/constant";
import { useRole } from "@/utils/context/roleContext";
import { escapeFormData, formatNumberLocale } from "@/utils/function";
import { withdrawalFormSchema, WithdrawalFormValues } from "@/utils/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

const DashboardWithdrawModalWithdraw = () => {
  const [open, setOpen] = useState(false);
  const { earnings: earningsState, setEarnings } = useUserEarningsStore();
  const { teamMemberProfile } = useRole();

  const { isWithdrawalToday, setIsWithdrawalToday } =
    useUserHaveAlreadyWithdraw();

  const { toast } = useToast();

  const form = useForm<WithdrawalFormValues>({
    mode: "onChange",
    resolver: zodResolver(withdrawalFormSchema),
    defaultValues: {
      earnings: "",
      amount: "",
      bank: "",
      accountName: "",
      accountNumber: "",
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = form;

  const selectedEarnings = useWatch({ control, name: "earnings" });
  const amount = watch("amount");

  const fetchEarnings = async () => {
    try {
      if (!open || earningsState) return;
      const { userEarningsData } = await getUserEarnings({
        memberId: teamMemberProfile.company_member_id,
      });
      setEarnings(userEarningsData);
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

  useEffect(() => {
    fetchEarnings();
  }, [earningsState]);

  const getMaxAmount = () => {
    switch (selectedEarnings) {
      case "PACKAGE":
        return earningsState?.company_package_earnings ?? 0;
      case "REFERRAL":
        return earningsState?.company_referral_earnings ?? 0;
      default:
        return 0;
    }
  };

  const handleWithdrawalRequest = async (data: WithdrawalFormValues) => {
    try {
      const sanitizedData = escapeFormData(data);

      // if (!captchaToken) {
      //   toast({
      //     title: "Captcha Required",
      //     description:
      //       "Please verify that you are human by completing the captcha",
      //     variant: "destructive",
      //   });
      //   return;
      // }

      await createWithdrawalRequest({
        WithdrawFormValues: sanitizedData,
        teamMemberId: teamMemberProfile.company_member_id,
      });

      switch (selectedEarnings) {
        case "PACKAGE":
          if (earningsState) {
            let remainingAmount = Number(sanitizedData.amount);

            const olympusDeduction = Math.min(
              remainingAmount,
              earningsState.company_package_earnings
            );
            remainingAmount -= olympusDeduction;

            if (remainingAmount > 0) {
              break;
            }

            // Update state with new earnings values
            setEarnings({
              ...earningsState,
              company_combined_earnings:
                earningsState.company_combined_earnings -
                Number(sanitizedData.amount),
              company_package_earnings:
                earningsState.company_package_earnings - olympusDeduction,
            });
          }

          setIsWithdrawalToday({
            ...isWithdrawalToday,
            package: true,
          });
          break;
        case "REFERRAL":
          if (earningsState) {
            // Remaining amount to be deducted

            let remainingAmount = Number(sanitizedData.amount);

            // Calculate Referral Bounty deduction
            const referralDeduction = Math.min(
              remainingAmount,
              earningsState.company_referral_earnings
            );

            remainingAmount -= referralDeduction;

            if (remainingAmount > 0) {
              break;
            }

            // Update state with new earnings values
            setEarnings({
              ...earningsState,
              company_combined_earnings:
                earningsState.company_combined_earnings -
                Number(sanitizedData.amount),
              company_referral_earnings:
                earningsState.company_referral_earnings - referralDeduction,
            });
          }

          setIsWithdrawalToday({
            ...isWithdrawalToday,
            referral: true,
          });

          break;

        default:
          break;
      }

      toast({
        title: "Withdrawal Request Successfully",
        description: "Please wait for it to be approved",
      });

      reset();
      setOpen(false);
    } catch (e) {
      if (e instanceof Error) {
        toast({
          title: "Error",
          description: e.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleCalculateTotalWithdrawal = () => {
    const totalWithdrawal = Number(amount) - Number(amount) * 0.1;
    return formatNumberLocale(totalWithdrawal);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(handleWithdrawalRequest)}
        className="space-y-4 w-full"
      >
        <FormField
          control={control}
          name="earnings"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);

                    // Set the withdrawal amount based on the selected type
                    if (value === "PACKAGE") {
                      setValue(
                        "amount",
                        earningsState?.company_package_earnings.toFixed(2) ??
                          "0"
                      );
                    } else if (value === "REFERRAL") {
                      setValue(
                        "amount",
                        earningsState?.company_referral_earnings.toFixed(2) ??
                          "0"
                      );
                    }
                  }}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Income To Withdraw:">
                      {field.value === "PACKAGE"
                        ? `₱ ${formatNumberLocale(
                            earningsState?.company_package_earnings ?? 0
                          )}`
                        : `₱ ${formatNumberLocale(
                            earningsState?.company_referral_earnings ?? 0
                          )}`}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {isWithdrawalToday.package && (
                      <SelectItem className="text-xs" value="PACKAGE">
                        Trading Earnings ₱{" "}
                        {formatNumberLocale(
                          earningsState?.company_package_earnings ?? 0
                        )}
                      </SelectItem>
                    )}

                    {isWithdrawalToday.referral && (
                      <SelectItem className="text-xs" value="REFERRAL">
                        Referral And Matrix Earnings ₱{" "}
                        {formatNumberLocale(
                          earningsState?.company_referral_earnings ?? 0
                        )}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="bank"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                  }}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select E-Wallet / Bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankData.map((bank, index) => (
                      <SelectItem key={index} value={bank}>
                        {bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="accountName"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="text"
                  id="accountName"
                  variant="non-card"
                  placeholder="Account Name:"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="accountNumber"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="text"
                  variant="non-card"
                  id="accountNumber"
                  placeholder="Account Number:"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="amount"
          render={({ field }) => (
            <FormItem className="relative">
              <FormControl>
                <Input
                  type="text"
                  id="amount"
                  variant="non-card"
                  placeholder="Request amount:"
                  {...field}
                  value={field.value}
                  onChange={(e) => {
                    let value = e.target.value;

                    if (value === "") {
                      field.onChange("");
                      return;
                    }

                    value = value.replace(/[^0-9.]/g, "");

                    const parts = value.split(".");
                    if (parts.length > 2) {
                      value = `${parts[0]}.${parts[1]}`;
                    }

                    // Limit to 2 decimal places
                    if (parts[1]?.length > 2) {
                      value = `${parts[0]}.${parts[1].substring(0, 2)}`;
                    }

                    if (value.startsWith("0")) {
                      value = value.replace(/^0+/, "");
                    }

                    // Limit total length to 10 characters
                    if (Math.floor(Number(value)).toString().length > 7) {
                      value = value.substring(0, 7);
                    }

                    if (Number(value) > getMaxAmount()) {
                      value = getMaxAmount()
                        .toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                        .toString();
                    }
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <Button
                type="button"
                size="sm"
                className=" bg-white stroke-text-orange border-2 rounded-xl text-xs  absolute right-2 top-1 p-0  px-2 py-0 border-orange-500"
                onClick={() => {
                  if (!selectedEarnings) {
                    toast({
                      title: "No Income To Withdraw",
                      description: "Please select an earnings",
                      variant: "destructive",
                    });
                    return;
                  }
                  setValue("amount", formatNumberLocale(getMaxAmount()));
                }}
              >
                MAX
              </Button>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amount Input */}
        <div className="flex flex-col w-full space-y-2 ">
          <div className="flex items-start justify-center w-full gap-2 border-2 bg-transparent rounded-md h-40 p-2 border-orange-600">
            <span className="text-xs stroke-text-orange">
              10% TAX FOR EVERY WITHDRAWAL
            </span>
          </div>
        </div>

        <div className="flex flex-col w-full space-y-2 ">
          <div className="flex flex-col items-center justify-center w-full gap-2 border-2 bg-transparent rounded-md p-2 border-orange-600">
            <Label>TOTAL WITHDRAWAL:</Label>
            <div className="flex justify-between items-center gap-2">
              <span className="text-sm text-orange-600 font-black">₱</span>
              <span className="text-xs stroke-text-orange">
                {handleCalculateTotalWithdrawal()}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}

        {/* <div className="w-full flex items-center justify-center">
          <Turnstile
            size="flexible"
            sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""}
            onVerify={(token) => {
              setCaptchaToken(token);
            }}
          />
        </div> */}
        <div className="w-full flex justify-center">
          <Button
            variant="card"
            className=" font-black text-2xl rounded-full p-5"
            disabled={isSubmitting || getMaxAmount() === 0}
            type="submit"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : null} Submit
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DashboardWithdrawModalWithdraw;
