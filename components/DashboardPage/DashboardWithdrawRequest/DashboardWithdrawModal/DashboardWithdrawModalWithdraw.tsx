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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { logError } from "@/services/Error/ErrorLogs";
import { getEarnings } from "@/services/User/User";
import { createWithdrawalRequest } from "@/services/Withdrawal/Member";
import {
  calculateFee,
  calculateFinalAmount,
  escapeFormData,
} from "@/utils/function";
import { createClientSide } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { alliance_earnings_table, alliance_member_table } from "@prisma/client";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

type Props = {
  teamMemberProfile: alliance_member_table;
  earnings: alliance_earnings_table;
};

const withdrawalFormSchema = z.object({
  earnings: z.string(),
  amount: z
    .string()
    .min(3, "Minimum amount is required atleast 200 pesos")
    .refine((amount) => parseInt(amount, 10) >= 200, {
      message: "Amount must be at least 200 pesos",
    }),
  bank: z.string().min(1, "Please select a bank"),
  accountName: z.string().min(6, "Account name is required"),
  accountNumber: z.string().min(6, "Account number is required"),
});

export type WithdrawalFormValues = z.infer<typeof withdrawalFormSchema>;

const bankData = ["GCASH", "MAYA", "GOTYME", "UNIONBANK", "BDO", "BPI"];

const DashboardWithdrawModalWithdraw = ({
  teamMemberProfile,
  earnings: initialEarnings,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [earnings, setEarnings] =
    useState<alliance_earnings_table>(initialEarnings);
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
      if (!open) return;
      const earnings = await getEarnings();
      setEarnings(earnings);
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
  }, [open]);

  const getMaxAmount = () => {
    switch (selectedEarnings) {
      case "TOTAL":
        return earnings.alliance_olympus_earnings;
      case "DIRECT REFERRAL":
        return earnings.alliance_ally_bounty;
      case "INDIRECT REFERRAL":
        return earnings.alliance_legion_bounty;
      default:
        return 0;
    }
  };

  const validateAmount = () => {
    const maxAmount = getMaxAmount();
    if (parseFloat(amount || "0") > maxAmount) {
      setValue("amount", maxAmount.toString());
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
        case "TOTAL":
          setEarnings({
            ...earnings,
            alliance_olympus_earnings:
              earnings.alliance_olympus_earnings - Number(sanitizedData.amount),
          });
          break;
        case "DIRECT REFERRAL":
          setEarnings({
            ...earnings,
            alliance_ally_bounty:
              earnings.alliance_ally_bounty - Number(sanitizedData.amount),
          });
          break;
        case "INDIRECT REFERRAL":
          setEarnings({
            ...earnings,
            alliance_legion_bounty:
              earnings.alliance_legion_bounty - Number(sanitizedData.amount),
          });
          break;
        default:
          break;
      }
      toast({
        title: "Withdrawal Request Successfully",
        description: "Please wait for it to be approved",
        variant: "success",
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
        <Button variant="outline" onClick={() => setOpen(true)}>
          Withdraw
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full sm:max-w-[400px]">
        <ScrollArea className="w-full sm:max-w-[400px] max-h-[620px] ">
          <DialogHeader>
            <DialogTitle>Withdraw Request</DialogTitle>
            <DialogDescription>
              Withdraw your earnings to your account
            </DialogDescription>
          </DialogHeader>
          {selectedEarnings && (
            <Alert variant="destructive" className="my-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Withdrawal Fee Notice</AlertTitle>
              <AlertDescription>
                {
                  "10% withdrawal fee will be deducted from your withdrawal amount"
                }
              </AlertDescription>
            </Alert>
          )}

          <form
            onSubmit={handleSubmit(handleWithdrawalRequest)}
            className="space-y-4"
            onChange={validateAmount} // Validate whenever form changes
          >
            {/* Earnings Select */}
            <div>
              <Label htmlFor="earnings">Earnings</Label>
              <Controller
                name="earnings"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="SELECT EARNINGS" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TOTAL">
                        TOTAL EARNINGS (₱
                        {earnings.alliance_olympus_earnings.toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                        )
                      </SelectItem>
                      <SelectItem value="DIRECT REFERRAL">
                        DIRECT REFERRAL (₱
                        {earnings.alliance_ally_bounty.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        )
                      </SelectItem>
                      <SelectItem value="INDIRECT REFERRAL">
                        INDIRECT REFERRAL (₱
                        {earnings.alliance_legion_bounty.toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                        )
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.earnings && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.earnings.message}
                </p>
              )}
            </div>

            {/* Bank Type Select */}
            <div>
              <Label htmlFor="bank">Bank Type</Label>
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
                      <SelectValue placeholder="SELECT BANK" />
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
                <p className="text-red-500 text-sm mt-1">
                  {errors.bank.message}
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
                <p className="text-red-500 text-sm mt-1">
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
                <p className="text-red-500 text-sm mt-1">
                  {errors.accountNumber.message}
                </p>
              )}
            </div>

            {/* Amount Input */}
            <div className="flex flex-col w-full space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="flex items-center justify-between w-full">
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      id="amount"
                      className="w-full flex-grow"
                      placeholder="Enter amount"
                      {...field}
                      value={field.value}
                      onChange={(e) => {
                        let inputValue = e.target.value;

                        if (inputValue.startsWith("0")) {
                          inputValue = "";
                        }

                        inputValue = inputValue.replace(/\D/g, "");

                        field.onChange(inputValue);

                        const numericValue = parseFloat(inputValue);
                        const maxAmount = getMaxAmount();

                        if (numericValue > maxAmount) {
                          setValue("amount", maxAmount.toString());
                        }
                      }}
                    />
                  )}
                />

                <Button
                  type="button"
                  className="ml-2 bg-blue-500 text-white"
                  onClick={() => setValue("amount", getMaxAmount().toString())}
                >
                  MAX
                </Button>
              </div>
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.amount.message}
                </p>
              )}
            </div>
            {amount && (
              <div className="flex flex-col w-full space-y-2">
                <Label htmlFor="amountToWithdraw">Amount Computation</Label>
                <div className="flex flex-col gap-2 items-end justify-end w-full">
                  {/* Fee Display */}
                  <div className="flex items-center justify-between w-full">
                    <p className="text-md darktext-gray-200">{"10%"} Fee:</p>
                    <p className="text-md  dark:text-gray-300">
                      {"₱ "}
                      {calculateFee(
                        Number(amount || 0),
                        selectedEarnings
                      ).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  <div className="flex items-center justify-between w-full">
                    <p className="text-md  dark:text-gray-200">Amount</p>
                    <p className="text-md  dark:text-gray-300">
                      {"₱ "}
                      {Number(amount || 0).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  {/* Separator */}
                  <Separator />

                  {/* Final Amount Display */}
                  <div className="flex items-center justify-between w-full">
                    <p className="text-md font-bold">Amount to be Received</p>
                    <p className="text-md font-bold dark:text-gray-300">
                      {"₱ "}
                      {calculateFinalAmount(
                        Number(amount || 0),
                        selectedEarnings
                      ).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <Button
              disabled={isSubmitting || getMaxAmount() === 0}
              type="submit"
              className="w-full pb-2"
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

          <DialogFooter></DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardWithdrawModalWithdraw;
