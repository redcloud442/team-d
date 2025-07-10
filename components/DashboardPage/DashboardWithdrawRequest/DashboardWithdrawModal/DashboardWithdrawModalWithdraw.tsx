"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SelectField from "@/components/ui/select-component";
import { useToast } from "@/hooks/use-toast";
import BDO from "@/public/assets/svg/bdo";
import BPI from "@/public/assets/svg/bpi";
import Gcash from "@/public/assets/svg/gcash";
import GoTyme from "@/public/assets/svg/gotyme";
import Maya from "@/public/assets/svg/maya";
import MetroB from "@/public/assets/svg/metrob";
import { getUserEarnings } from "@/services/User/User";
import { createWithdrawalRequest } from "@/services/Withdrawal/Member";
import { useUserDashboardEarningsStore } from "@/store/useUserDashboardEarnings";
import { useUserEarningsStore } from "@/store/useUserEarningsStore";
import { useUserHaveAlreadyWithdraw } from "@/store/useWithdrawalToday";
import { useRole } from "@/utils/context/roleContext";
import { escapeFormData, formatNumberLocale } from "@/utils/function";
import { withdrawalFormSchema, WithdrawalFormValues } from "@/utils/schema";
import { TransactionHistory } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

const DashboardWithdrawModalWithdraw = () => {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const { earnings: earningsState, setEarnings } = useUserEarningsStore();
  const { totalEarnings } = useUserDashboardEarningsStore();
  const { teamMemberProfile } = useRole();

  const vatAmount = useMemo(() => {
    return (totalEarnings?.withdrawalAmount ?? 0) * 0.1;
  }, [totalEarnings?.withdrawalAmount]);

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
            package: false,
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
            referral: false,
          });

          break;

        default:
          break;
      }
      return { data: sanitizedData };
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

  const queryKey = [
    "transaction-history",
    "WITHDRAWAL",
    teamMemberProfile?.company_member_id,
    1,
  ];

  const { mutate: WithdrawalRequest, isPending } = useMutation({
    mutationFn: async (data: WithdrawalFormValues) => {
      await handleWithdrawalRequest(data);
    },
    onMutate: () => {
      const { accountName, accountNumber, amount } = form.getValues();
      queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      const newTransaction = {
        company_transaction_id: uuidv4(),
        company_transaction_date: new Date(),
        company_transaction_description: "Pending",
        company_transaction_details: `Account Name: ${accountName}, Account Number: ${accountNumber}`,
        company_transaction_amount: Number(amount),
        company_transaction_member_id: teamMemberProfile.company_member_id,
        company_transaction_type: "WITHDRAWAL",
      };

      if (previousData) {
        queryClient.setQueryData(queryKey, (oldData: TransactionHistory) => {
          const data = oldData;

          return {
            ...data,
            transactions: [newTransaction, ...(data.transactions || [])],
            total: data.total + 1,
          };
        });

        return { previousData };
      }
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Request Successfully",
        description: "You will be redirected shortly",
      });
      setOpen(false);
    },
    onError: (error, data, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey,
        exact: false,
      });
      reset();
    },
  });

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

  const handleWithdrawalCreate = (data: WithdrawalFormValues) => {
    if (data.earnings === "REFERRAL" && !isWithdrawalToday.referral) {
      toast({
        title: "Invalid Request",
        description:
          "You have already made a Referral withdrawal request today.",
        variant: "destructive",
      });
      return;
    }

    if (data.earnings === "PACKAGE" && !isWithdrawalToday.package) {
      toast({
        title: "Invalid Request",
        description:
          "You have already made a Subscription withdrawal request today.",
        variant: "destructive",
      });
      return;
    }

    if (data.earnings === "VAT") {
      toast({
        title: "Invalid , Non - Withdrawable Earnings",
        description: "You cannott withdraw your VAT.",
        variant: "destructive",
      });
      return;
    }

    WithdrawalRequest(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={!isWithdrawalToday.referral && !isWithdrawalToday.package}
          className="h-12 text-xl font-bold w-full"
        >
          Withdraw
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="hidden">
          <DialogTitle>Withdraw Request</DialogTitle>

          <DialogDescription>
            Please fill out the form below to request a withdrawal.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="sm:h-auto h-[600px] space-y-4">
          <div className="flex flex-col pb-4">
            <div className="space-x-1">
              <span className="text-2xl font-normal text-white">
                Withdraw Request
              </span>
            </div>
          </div>
          <div className="w-full flex justify-center">
            <Form {...form}>
              <form
                onSubmit={handleSubmit(handleWithdrawalCreate)}
                className="space-y-10 w-full max-w-md sm:max-w-4xl"
              >
                {!isWithdrawalToday.referral ||
                  (!isWithdrawalToday.package && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Notice</AlertTitle>
                      <AlertDescription>
                        You have already made a{" "}
                        {!isWithdrawalToday.referral
                          ? "Referral "
                          : "Subscription "}
                        withdrawal request today. Try again tomorrow.
                      </AlertDescription>
                    </Alert>
                  ))}

                <div className="space-y-4">
                  <SelectField
                    name="bank"
                    label="Select Bank"
                    control={control}
                    onChange={handleSelectedBank}
                    options={bankData.map((option) => ({
                      label: option.bank_name,
                      value: option.bank_name,
                    }))}
                  />

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
                                  earningsState?.company_package_earnings.toFixed(
                                    2
                                  ) ?? "0"
                                );
                              } else if (value === "REFERRAL") {
                                setValue(
                                  "amount",
                                  earningsState?.company_referral_earnings.toFixed(
                                    2
                                  ) ?? "0"
                                );
                              }
                            }}
                            value={field.value}
                          >
                            <SelectTrigger className="w-auto rounded-lg dark:bg-teal-500 h-12 text-white">
                              <SelectValue placeholder="Select Earnings">
                                {field.value === "PACKAGE"
                                  ? `₱ ${formatNumberLocale(
                                      earningsState?.company_package_earnings ??
                                        0
                                    )}`
                                  : field.value === "REFERRAL"
                                    ? `₱ ${formatNumberLocale(
                                        earningsState?.company_combined_earnings ??
                                          0
                                      )}`
                                    : `₱ ${formatNumberLocale(vatAmount ?? 0)}`}
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

                              <SelectItem className="text-xs" value="VAT">
                                Total VAT ₱ {formatNumberLocale(vatAmount ?? 0)}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={control}
                    name="accountName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="text"
                            id="accountName"
                            className="rounded-lg w-full bg-teal-500 text-white dark:placeholder:text-white h-12"
                            placeholder="Enter Full Name"
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
                      <FormItem>
                        <FormControl>
                          <Input
                            type="text"
                            className="rounded-lg w-full bg-teal-500 text-white dark:placeholder:text-white h-12"
                            id="accountNumber"
                            placeholder="Enter Account Number"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem className="w-full flex flex-col items-stretch">
                        <div className="flex w-full gap-2">
                          <FormControl className="flex-1">
                            <Input
                              type="text"
                              id="amount"
                              className="rounded-lg w-full bg-teal-500 text-white dark:placeholder:text-white h-12"
                              placeholder="Enter Amount"
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

                                if (parts[1]?.length > 2) {
                                  value = `${parts[0]}.${parts[1].substring(0, 2)}`;
                                }

                                if (value.startsWith("0")) {
                                  value = value.replace(/^0+/, "");
                                }

                                if (
                                  Math.floor(Number(value)).toString().length >
                                  7
                                ) {
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
                            className="rounded-lg px-4 h-12 bg-teal-500 text-white"
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
                      </FormItem>
                    )}
                  />
                  <Input
                    type="text"
                    className="rounded-lg w-full bg-teal-500 text-white dark:placeholder:text-white h-12"
                    id="totalVAT"
                    placeholder="Total VAT:"
                    value={
                      handleCalculateVAT === "0.00"
                        ? "Total VAT"
                        : handleCalculateVAT
                    }
                    readOnly
                  />

                  <Input
                    type="text"
                    className="rounded-lg w-full bg-teal-500 text-white dark:placeholder:text-white h-12"
                    id="amountToRecieve"
                    placeholder="Amount to Recieve:"
                    value={
                      handleCalculateTotalWithdrawal === "0.00"
                        ? "Amount to Recieve"
                        : handleCalculateTotalWithdrawal
                    }
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
                    disabled={isSubmitting || isPending}
                    type="submit"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : null}{" "}
                    Submit
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardWithdrawModalWithdraw;
