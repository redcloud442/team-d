"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import BDO from "@/public/assets/svg/bdo";
import BPI from "@/public/assets/svg/bpi";
import Gcash from "@/public/assets/svg/gcash";
import GoTyme from "@/public/assets/svg/gotyme";
import Maya from "@/public/assets/svg/maya";
import MetroB from "@/public/assets/svg/metrob";
import { getUserEarnings } from "@/services/User/User";
import { createWithdrawalRequest } from "@/services/Withdrawal/Member";
import { useUserEarningsStore } from "@/store/useUserEarningsStore";
import { useUserHaveAlreadyWithdraw } from "@/store/useWithdrawalToday";
import { useRole } from "@/utils/context/roleContext";
import { escapeFormData, formatNumberLocale } from "@/utils/function";
import { withdrawalFormSchema, WithdrawalFormValues } from "@/utils/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

const DashboardWithdrawModalWithdraw = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

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
      phoneNumber: undefined,
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
      if (!isWithdrawalToday.referral) {
        toast({
          title: "Invalid Request",
          description:
            "You have already made a Referral withdrawal request today.",
          variant: "destructive",
        });
        return;
      }

      if (!isWithdrawalToday.package) {
        toast({
          title: "Invalid Request",
          description:
            "You have already made a Subscription withdrawal request today.",
          variant: "destructive",
        });
        return;
      }

      const sanitizedData = escapeFormData(data);

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
        description: "You will be redirected shortly",
      });

      queryClient.invalidateQueries({
        queryKey: [
          "transaction-history",
          "WITHDRAW",
          teamMemberProfile?.company_member_id,
        ],
      });

      reset();
      setTimeout(() => {
        router.push("/digi-dash");
      }, 1000);
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

  const handleCalculateTotalWithdrawal = useMemo(() => {
    const totalWithdrawal = Number(amount) - Number(amount) * 0.1;
    return formatNumberLocale(totalWithdrawal);
  }, [amount]);

  const handleCalculateVAT = useMemo(() => {
    const vat = Number(amount) * 0.1;
    return formatNumberLocale(vat);
  }, [amount]);

  const handleSelectedBank = (value: string) => {
    setValue("bank", value);
  };

  const bankData = [
    { bank_name: "Gotyme", bank_image: <GoTyme /> },
    { bank_name: "Gcash", bank_image: <Gcash /> },
    { bank_name: "BPI", bank_image: <BPI /> },
    { bank_name: "PayMaya", bank_image: <Maya /> },
    { bank_name: "Metro Bank", bank_image: <MetroB /> },
    { bank_name: "BDO", bank_image: <BDO /> },
  ];

  return (
    <div className="w-full flex justify-center">
      <Form {...form}>
        <form
          onSubmit={handleSubmit(handleWithdrawalRequest)}
          className="space-y-3 w-full max-w-md sm:max-w-4xl"
        >
          <div className="text-xl font-bold">
            <span className="text-bg-primary-blue"> 1. SELECT</span> BANK
          </div>
          {!isWithdrawalToday.referral ||
            (!isWithdrawalToday.package && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Notice</AlertTitle>
                <AlertDescription>
                  You have already made a{" "}
                  {!isWithdrawalToday.referral ? "Referral " : "Subscription "}
                  withdrawal request today. Try again tomorrow.
                </AlertDescription>
              </Alert>
            ))}
          <FormField
            control={control}
            name="bank"
            render={({ field }) => (
              <FormItem>
                <FormMessage />
                <div className="grid grid-cols-3 gap-4 mt-2">
                  {bankData.map((option) => {
                    return (
                      <button
                        key={option.bank_name}
                        type="button"
                        onClick={() => {
                          field.onChange(option.bank_name);

                          handleSelectedBank(option.bank_name);
                        }}
                        className={cn(
                          "flex flex-col items-center justify-center rounded-xl p-2 gap-2 transition-all",
                          field.value === option.bank_name &&
                            "border border-bg-primary-blue bg-bg-primary/10"
                        )}
                      >
                        {option.bank_image}

                        {/* Select Button */}
                        <span
                          className={cn(
                            "mt-1 px-2 py-1 rounded-md text-xs font-bold",
                            field.value === option.bank_name
                              ? "bg-bg-primary-blue text-black"
                              : "bg-gray-300 text-black"
                          )}
                        >
                          SELECT
                        </span>
                      </button>
                    );
                  })}
                </div>
              </FormItem>
            )}
          />

          <div className="text-xl font-bold">
            <span className="text-bg-primary-blue"> 2. FILL-UP</span> FORM
          </div>

          <FormField
            control={control}
            name="earnings"
            render={({ field }) => (
              <FormItem className="flex justify-between items-center">
                <FormLabel className="space-x-1">
                  <span className="text-bg-primary-blue">-</span>
                  <span>Select Earnings</span>
                </FormLabel>
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
                    <SelectTrigger className="w-auto rounded-lg">
                      <SelectValue placeholder="Select Earnings">
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
                      <SelectItem className="text-xs" value="PACKAGE">
                        Subscription Earnings ₱{" "}
                        {formatNumberLocale(
                          earningsState?.company_package_earnings ?? 0
                        )}
                      </SelectItem>

                      <SelectItem className="text-xs" value="REFERRAL">
                        Referral And Unilevel Earnings ₱{" "}
                        {formatNumberLocale(
                          earningsState?.company_referral_earnings ?? 0
                        )}
                      </SelectItem>
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
              <FormItem className="flex justify-between items-center">
                <FormLabel className="space-x-1">
                  <span className="text-bg-primary-blue">-</span>
                  <span>Full Name</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    id="accountName"
                    variant="non-card"
                    className="rounded-lg w-fit bg-bg-primary-blue text-black dark:placeholder:text-black"
                    placeholder="Full Name:"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="accountNumber"
            render={({ field }) => (
              <FormItem className="flex justify-between items-center">
                <FormLabel className="space-x-1">
                  <span className="text-bg-primary-blue">-</span>
                  <span>Account Number</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    variant="non-card"
                    className="rounded-lg w-fit bg-bg-primary-blue text-black dark:placeholder:text-black"
                    id="accountNumber"
                    placeholder="Account Number:"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem className="flex justify-between items-center">
                <FormLabel className="space-x-1">
                  <span className="text-bg-primary-blue">-</span>
                  <span>Phone Number</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    variant="non-card"
                    className="rounded-lg w-fit bg-bg-primary-blue text-black dark:placeholder:text-black"
                    id="phoneNumber"
                    placeholder="Phone Number:"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="amount"
            render={({ field }) => (
              <FormItem className="flex justify-between items-center">
                <FormLabel className="space-x-1">
                  <span className="text-bg-primary-blue">-</span>
                  <span>Balance</span>
                </FormLabel>
                <div className="flex flex-col items-start relative">
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input
                        type="text"
                        id="amount"
                        variant="non-card"
                        className="rounded-lg w-fit bg-bg-primary-blue text-black dark:placeholder:text-black"
                        placeholder="Balance amount:"
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
                            value = getMaxAmount().toString();
                          }
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      size="sm"
                      className=" rounded-lg px-2 py-0 bg-bg-primary-blue"
                      onClick={() => {
                        if (!selectedEarnings) {
                          toast({
                            title: "No Income To Withdraw",
                            description: "Please select an earnings",
                            variant: "destructive",
                          });
                          return;
                        }
                        setValue("amount", getMaxAmount().toFixed(2));
                      }}
                    >
                      MAX
                    </Button>
                  </div>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <div className="flex justify-between items-center">
            <Label className="space-x-1">
              <span className="text-bg-primary-blue">-</span>
              <span>Total VAT</span>
            </Label>

            <Input
              type="text"
              variant="non-card"
              className="rounded-lg w-fit bg-bg-primary-blue text-black dark:placeholder:text-black"
              id="totalVAT"
              placeholder="Total VAT:"
              value={handleCalculateVAT}
              readOnly
            />
          </div>

          <div className="flex justify-between items-center">
            <Label className="space-x-1">
              <span className="text-bg-primary-blue">-</span>
              <span>Amount to Recieve</span>
            </Label>

            <Input
              type="text"
              variant="non-card"
              className="rounded-lg w-fit bg-bg-primary-blue text-black dark:placeholder:text-black"
              id="amountToRecieve"
              placeholder="Amount to Recieve:"
              value={handleCalculateTotalWithdrawal}
              readOnly
            />
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
              className=" font-black rounded-lg p-4"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : null}{" "}
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default DashboardWithdrawModalWithdraw;
