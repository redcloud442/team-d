import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { logError } from "@/services/Error/ErrorLogs";
import { getUserEarnings } from "@/services/User/User";
import { createWithdrawalRequest } from "@/services/Withdrawal/Member";
import { useUserTransactionHistoryStore } from "@/store/useTransactionStore";
import { useUserEarningsStore } from "@/store/useUserEarningsStore";
import { useUserHaveAlreadyWithdraw } from "@/store/useWithdrawalToday";
import { calculateFinalAmount, escapeFormData } from "@/utils/function";
import { createClientSide } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { alliance_earnings_table, alliance_member_table } from "@prisma/client";
import { AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

type Props = {
  teamMemberProfile: alliance_member_table;
  earnings: alliance_earnings_table | null;
  setTransactionOpen: Dispatch<SetStateAction<boolean>>;
};

const withdrawalFormSchema = z.object({
  earnings: z.string(),
  amount: z
    .string()
    .min(2, "Minimum amount is required atleast 50 pesos")
    .refine((amount) => parseInt(amount.replace(/,/g, ""), 10) >= 50, {
      message: "Amount must be at least 50 pesos",
    }),

  bank: z.string().min(1, "Please select a bank"),
  accountName: z
    .string()
    .min(6, "Account name is required")
    .max(40, "Account name must be at most 24 characters"),
  accountNumber: z
    .string()
    .min(6, "Account number is required")
    .max(24, "Account number must be at most 24 digits"),
});

export type WithdrawalFormValues = z.infer<typeof withdrawalFormSchema>;

const bankData = ["Gotyme", "Gcash", "BPI", "PayMaya"];

const DashboardWithdrawModalWithdraw = ({
  teamMemberProfile,
  earnings,
  setTransactionOpen,
}: Props) => {
  const [open, setOpen] = useState(false);
  const { earnings: earningsState, setEarnings } = useUserEarningsStore();
  const { setAddTransactionHistory } = useUserTransactionHistoryStore();
  const { isWithdrawalToday, setIsWithdrawalToday } =
    useUserHaveAlreadyWithdraw();

  const supabase = createClientSide();
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WithdrawalFormValues>({
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

  const selectedEarnings = useWatch({ control, name: "earnings" });
  const amount = watch("amount");

  const fetchEarnings = async () => {
    try {
      if (!open || earningsState) return;
      const { userEarningsData } = await getUserEarnings({
        memberId: teamMemberProfile.alliance_member_id,
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
        return earnings?.alliance_olympus_earnings ?? 0;
      case "REFERRAL":
        return earnings?.alliance_referral_bounty ?? 0;
      default:
        return 0;
    }
  };

  const handleWithdrawalRequest = async (data: WithdrawalFormValues) => {
    try {
      const sanitizedData = escapeFormData(data);

      await createWithdrawalRequest({
        WithdrawFormValues: sanitizedData,
        teamMemberId: teamMemberProfile.alliance_member_id,
      });

      switch (selectedEarnings) {
        case "PACKAGE":
          if (earnings) {
            let remainingAmount = Number(sanitizedData.amount);

            const olympusDeduction = Math.min(
              remainingAmount,
              earnings.alliance_olympus_earnings
            );
            remainingAmount -= olympusDeduction;

            if (remainingAmount > 0) {
              break;
            }

            // Update state with new earnings values
            setEarnings({
              ...earnings,
              alliance_combined_earnings:
                earnings.alliance_combined_earnings -
                Number(sanitizedData.amount),
              alliance_olympus_earnings:
                earnings.alliance_olympus_earnings - olympusDeduction,
            });
          }

          setIsWithdrawalToday({
            ...isWithdrawalToday,
            package: true,
          });
          break;
        case "REFERRAL":
          if (earnings) {
            // Remaining amount to be deducted

            let remainingAmount = Number(sanitizedData.amount);

            // Calculate Referral Bounty deduction
            const referralDeduction = Math.min(
              remainingAmount,
              earnings.alliance_referral_bounty
            );

            remainingAmount -= referralDeduction;

            if (remainingAmount > 0) {
              break;
            }

            // Update state with new earnings values
            setEarnings({
              ...earnings,
              alliance_combined_earnings:
                earnings.alliance_combined_earnings -
                Number(sanitizedData.amount),
              alliance_referral_bounty:
                earnings.alliance_referral_bounty - referralDeduction,
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

      setAddTransactionHistory({
        data: [
          {
            transaction_id: uuidv4(),
            transaction_date: new Date(),
            transaction_description: "Withdrawal Pending",
            transaction_details: `Account Name: ${sanitizedData.accountName} | Account Number: ${sanitizedData.accountNumber}`,
            transaction_member_id: teamMemberProfile?.alliance_member_id ?? "",
            transaction_amount: Number(
              calculateFinalAmount(Number(amount), "TOTAL")
            ),
            transaction_attachment: "",
          },
        ],
        count: 1,
      });

      toast({
        title: "Withdrawal Request Successfully",
        description: "Please wait for it to be approved",
      });

      reset();
      setOpen(false);
    } catch (e) {
      if (e instanceof Error) {
        await logError(supabase, {
          errorMessage: e.message,
          stackTrace: e.stack,
          stackPath:
            "components/DashboardPage/DashboardWithdrawRequest/DashboardWithdrawModal/DashboardWithdrawModalWithdraw.tsx",
        });
      }
      const errorMessage =
        e instanceof Error ? e.message : "An unexpected error occurred.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          reset();
        }
      }}
    >
      <DialogTrigger asChild>
        {!isWithdrawalToday.package || !isWithdrawalToday.referral ? (
          <Button
            className=" relative h-60 sm:h-80 flex flex-col items-start sm:justify-center sm:items-center px-4 text-lg sm:text-2xl border-2"
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
                className="h-8 bg-pageColor  px-2 text-sm text-white"
                variant="card"
                onClick={() => setTransactionOpen(true)}
              >
                Transaction History
              </Button>
            </DialogTitle>

            <DialogDescription></DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(handleWithdrawalRequest)}
            className="space-y-4 mx-auto"
          >
            {/* Earnings Select */}
            <div>
              <Label htmlFor="earnings">Your Available Balance</Label>
              <Controller
                name="earnings"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);

                      // Set the withdrawal amount based on the selected type
                      if (value === "PACKAGE") {
                        setValue(
                          "amount",
                          earnings?.alliance_olympus_earnings.toFixed(2) ?? "0"
                        );
                      } else if (value === "REFERRAL") {
                        setValue(
                          "amount",
                          earnings?.alliance_referral_bounty.toFixed(2) ?? "0"
                        );
                      }
                    }}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Available Balance">
                        {field.value === "PACKAGE"
                          ? `Package Earnings ₱ ${(
                              earnings?.alliance_olympus_earnings ?? 0
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,

                              maximumFractionDigits: 2,
                            })}`
                          : `Referral Earnings ₱ ${(
                              earnings?.alliance_referral_bounty ?? 0
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,

                              maximumFractionDigits: 2,
                            })}`}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {!isWithdrawalToday.package && (
                        <SelectItem className="text-xs" value="PACKAGE">
                          Package Earnings ₱{" "}
                          {earnings?.alliance_olympus_earnings.toLocaleString(
                            "en-US",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          ) ?? 0}
                        </SelectItem>
                      )}

                      {!isWithdrawalToday.referral && (
                        <SelectItem className="text-xs" value="REFERRAL">
                          Referral Earnings ₱{" "}
                          {earnings?.alliance_referral_bounty.toLocaleString(
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
                )}
              />
              {errors.earnings && (
                <p className="text-primaryRed text-sm mt-1">
                  {errors.earnings.message}
                </p>
              )}
              <p className="text-sm font-bold text-primaryRed mt-1">
                {
                  "Note: You can only withdraw once per type of available balance."
                }
              </p>
            </div>

            {/* Bank Type Select */}
            <div>
              <Label htmlFor="bank">Select Your Bank</Label>
              <Controller
                name="bank"
                control={control}
                render={({ field }) => (
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
                )}
              />
              {errors.bank && (
                <p className="text-primaryRed text-sm mt-1">
                  {errors.bank.message}
                </p>
              )}
            </div>

            <div className="flex flex-col w-full space-y-2 ">
              <Label htmlFor="amount">Amount</Label>
              <div className="flex items-center justify-between w-full gap-2">
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
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
                  )}
                />
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
                    setValue(
                      "amount",
                      getMaxAmount()
                        .toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                        .toString()
                    );
                  }}
                >
                  MAX
                </Button>
              </div>
              {errors.amount && (
                <p className="text-primaryRed text-sm mt-1">
                  {errors.amount.message}
                </p>
              )}
            </div>

            {/* Account Name */}
            <div>
              <Label htmlFor="accountName">Account Name</Label>
              <Controller
                name="accountName"
                control={control}
                render={({ field }) => (
                  <Input
                    type="text"
                    id="accountName"
                    placeholder="Account Name"
                    {...field}
                  />
                )}
              />
              {errors.accountName && (
                <p className="text-primaryRed text-sm mt-1">
                  {errors.accountName.message}
                </p>
              )}
            </div>

            {/* Account Number */}
            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Controller
                name="accountNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    type="text"
                    id="accountNumber"
                    placeholder="Account Number"
                    {...field}
                  />
                )}
              />
              {errors.accountNumber && (
                <p className="text-primaryRed text-sm mt-1">
                  {errors.accountNumber.message}
                </p>
              )}
            </div>

            {/* Amount Input */}
            <div className="flex flex-col w-full space-y-2 ">
              <Label htmlFor="amount">Total Net Payout</Label>
              <div className="flex items-center justify-between w-full gap-2">
                <Input
                  id="amount"
                  className="w-full grow"
                  readOnly
                  value={calculateFinalAmount(
                    Number(amount.replace(/,/g, "") || 0),
                    selectedEarnings
                  ).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-center gap-2">
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
            </div>
          </form>

          <DialogFooter></DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardWithdrawModalWithdraw;
