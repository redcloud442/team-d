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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  calculateFinalAmount,
  escapeFormData,
  formatNumberLocale,
} from "@/utils/function";
import { withdrawalFormSchema, WithdrawalFormValues } from "@/utils/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Form, useForm, useWatch } from "react-hook-form";
import Turnstile from "react-turnstile";
import DashboardDynamicGuideModal from "../../DashboardDepositRequest/DashboardDynamicGuideModal/DashboardDynamicGuideModal";

type Props = {
  setTransactionOpen: Dispatch<SetStateAction<boolean>>;
};

const DashboardWithdrawModalWithdraw = ({ setTransactionOpen }: Props) => {
  const [open, setOpen] = useState(false);
  const { earnings: earningsState, setEarnings } = useUserEarningsStore();
  const { teamMemberProfile } = useRole();

  const { isWithdrawalToday, setIsWithdrawalToday } =
    useUserHaveAlreadyWithdraw();

  const [captchaToken, setCaptchaToken] = useState("");

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
    formState: { errors, isSubmitting },
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
      case "WINNING":
        return earningsState?.company_combined_earnings ?? 0;
      default:
        return 0;
    }
  };

  const handleWithdrawalRequest = async (data: WithdrawalFormValues) => {
    try {
      const sanitizedData = escapeFormData(data);

      if (!captchaToken) {
        toast({
          title: "Captcha Required",
          description:
            "Please verify that you are human by completing the captcha",
          variant: "destructive",
        });
        return;
      }

      await createWithdrawalRequest({
        WithdrawFormValues: sanitizedData,
        teamMemberId: teamMemberProfile.company_member_id,
        captchaToken: captchaToken,
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
        case "WINNING":
          if (earningsState) {
            // Remaining amount to be deducted

            let remainingAmount = Number(sanitizedData.amount);

            // Calculate Referral Bounty deduction
            const winningDeduction = Math.min(
              remainingAmount,
              earningsState.company_combined_earnings
            );

            remainingAmount -= winningDeduction;

            if (remainingAmount > 0) {
              break;
            }

            // Update state with new earnings values
            setEarnings({
              ...earningsState,
              company_combined_earnings:
                earningsState.company_combined_earnings -
                Number(sanitizedData.amount),
            });
          }

          setIsWithdrawalToday({
            ...isWithdrawalToday,
            winning: true,
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

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setCaptchaToken("");
          reset();
        }
      }}
    >
      <DialogTrigger asChild>
        {!isWithdrawalToday.package ||
        !isWithdrawalToday.referral ||
        !isWithdrawalToday.winning ? (
          <Button
            className=" relative h-60 sm:h-80 flex flex-col items-start sm:justify-center sm:items-center px-4 text-lg sm:text-2xl border-2 "
            onClick={() => setOpen(true)}
          >
            Withdraw
            <Image
              src="/assets/withdraw.png"
              alt="deposit"
              width={200}
              height={200}
              priority
            />
          </Button>
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <Button className=" relative h-60 sm:h-80 flex flex-col items-start sm:justify-center sm:items-center px-4 text-lg sm:text-2xl border-2">
                Withdraw
                <Image
                  src="/assets/withdraw.png"
                  alt="deposit"
                  width={200}
                  height={200}
                  priority
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full">
              <Alert variant={"destructive"}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Withdrawal Limit</AlertTitle>
                <AlertDescription>
                  You can only withdraw once per type of available balance a
                  day. Please check back tomorrow.
                </AlertDescription>
              </Alert>
            </PopoverContent>
          </Popover>
        )}
      </DialogTrigger>

      <DialogContent type="earnings" className="w-full sm:max-w-[400px]">
        <ScrollArea className="w-full relative sm:max-w-[400px] h-[600px] sm:h-full">
          <DialogHeader className="text-start text-2xl font-bold">
            <DialogTitle className="text-2xl font-bold mb-4 flex gap-4">
              Withdrawal Request
              <Button
                className="h-8 bg-pageColor px-2 text-sm text-white rounded-md"
                variant="card"
                onClick={() => setTransactionOpen(true)}
              >
                Transaction History
              </Button>
            </DialogTitle>

            <DialogDescription className="w-full">
              <DashboardDynamicGuideModal type="withdraw" />
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={handleSubmit(handleWithdrawalRequest)}
              className="space-y-4 mx-auto"
            >
              <FormField
                control={control}
                name="earnings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Earnings</FormLabel>
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
                          } else if (value === "WINNING") {
                            setValue(
                              "amount",
                              earningsState?.company_combined_earnings.toFixed(
                                2
                              ) ?? "0"
                            );
                          }
                        }}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Available Balance">
                            {field.value === "PACKAGE"
                              ? `Package Earnings ₱ ${formatNumberLocale(
                                  earningsState?.company_package_earnings ?? 0
                                )}`
                              : field.value === "REFERRAL"
                                ? `Referral Earnings ₱ ${formatNumberLocale(
                                    earningsState?.company_referral_earnings ??
                                      0
                                  )}`
                                : `Winning Earnings ₱ ${formatNumberLocale(
                                    earningsState?.company_combined_earnings ??
                                      0
                                  )}`}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {!isWithdrawalToday.package && (
                            <SelectItem className="text-xs" value="PACKAGE">
                              Package Earnings ₱{" "}
                              {formatNumberLocale(
                                earningsState?.company_package_earnings ?? 0
                              )}
                            </SelectItem>
                          )}

                          {!isWithdrawalToday.referral && (
                            <SelectItem className="text-xs" value="REFERRAL">
                              Referral Earnings ₱{" "}
                              {formatNumberLocale(
                                earningsState?.company_referral_earnings ?? 0
                              )}
                            </SelectItem>
                          )}

                          {!isWithdrawalToday.winning && (
                            <SelectItem className="text-xs" value="WINNING">
                              Winning Earnings ₱{" "}
                              {earningsState?.company_combined_earnings.toLocaleString(
                                "en-US",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              ) ?? 0}
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
                    <FormLabel>Select Bank</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Bank" />
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        id="amount"
                        className="w-full grow"
                        placeholder="Enter amount"
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
                      className="h-12 bg-pageColor text-white"
                      onClick={() => {
                        if (!selectedEarnings) {
                          toast({
                            title: "Select an earnings",
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

              <FormField
                control={control}
                name="accountName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        id="accountName"
                        placeholder="Account Name"
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
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        id="accountNumber"
                        placeholder="Account Number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount Input */}
              <div className="flex flex-col w-full space-y-2 ">
                <Label htmlFor="amount">Total Net Payout</Label>
                <div className="flex items-center justify-between w-full gap-2">
                  <Input
                    id="amount"
                    className="w-full grow"
                    readOnly
                    value={formatNumberLocale(
                      calculateFinalAmount(
                        Number(amount.replace(/,/g, "") || 0),
                        selectedEarnings
                      )
                    )}
                  />
                </div>
              </div>

              {/* Submit Button */}

              <div className="w-full flex items-center justify-center">
                <Turnstile
                  size="flexible"
                  sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""}
                  onVerify={(token) => {
                    setCaptchaToken(token);
                  }}
                />
              </div>

              <Button
                disabled={isSubmitting || getMaxAmount() === 0}
                type="submit"
                className="bg-pageColor text-white rounded-xl py-6 px-6"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardWithdrawModalWithdraw;
