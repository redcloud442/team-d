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
import FileUpload from "@/components/ui/dropZone";
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
import { getMerchantOptions } from "@/services/Options/Options";
import { handleDepositRequest } from "@/services/TopUp/Member";
import { useDepositStore } from "@/store/useDepositStore";
import { useUserTransactionHistoryStore } from "@/store/useTransactionStore";
import { useUserHaveAlreadyWithdraw } from "@/store/useWithdrawalToday";
import { escapeFormData } from "@/utils/function";
import { createClientSide } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { alliance_member_table, merchant_table } from "@prisma/client";

import { AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { NextResponse } from "next/server";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import DashboardDynamicGuideModal from "../DashboardDynamicGuideModal/DashboardDynamicGuideModal";

type Props = {
  teamMemberProfile: alliance_member_table;
  className: string;
};

const topUpFormSchema = z.object({
  amount: z
    .string()
    .min(3, "Amount is required and must be at least 200 pesos")
    .max(6, "Amount must be less than 6 digits")
    .regex(/^\d+$/, "Amount must be a number")
    .refine((amount) => parseInt(amount, 10) >= 200, {
      message: "Amount must be at least 200 pesos",
    }),
  topUpMode: z.string().min(1, "Top up mode is required"),
  accountName: z.string().min(1, "Field is required"),
  accountNumber: z.string().min(1, "Field is required"),
  file: z
    .instanceof(File)
    .refine((file) => !!file, { message: "File is required" })
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/jpg"].includes(file.type) &&
        file.size <= 12 * 1024 * 1024, // 12MB limit
      { message: "File must be a valid image and less than 12MB." }
    ),
});

export type TopUpFormValues = z.infer<typeof topUpFormSchema>;

const DashboardDepositModalDeposit = ({
  className,
  teamMemberProfile,
}: Props) => {
  const supabaseClient = createClientSide();
  const [topUpOptions, setTopUpOptions] = useState<merchant_table[]>([]);
  const { canUserDeposit, setCanUserDeposit } = useUserHaveAlreadyWithdraw();
  const { toast } = useToast();
  const { setAddTransactionHistory } = useUserTransactionHistoryStore();
  const { deposit: open, setDeposit: setOpen } = useDepositStore();

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TopUpFormValues>({
    resolver: zodResolver(topUpFormSchema),
    defaultValues: {
      amount: "",
      topUpMode: "",
      accountName: "",
      accountNumber: "",
      file: undefined,
    },
  });

  useEffect(() => {
    const getOptions = async () => {
      try {
        if (!open) return;
        const options = await getMerchantOptions();
        setTopUpOptions(options);
      } catch (e) {
        if (e instanceof Error) {
          await logError(supabaseClient, {
            errorMessage: e.message,
            stackTrace: e.stack,
            stackPath:
              "components/DashboardPage/DashboardDepositRequest/DashboardDepositModal/DashboardDepositModalDeposit.tsx",
          });
        }
      }
    };

    getOptions();
  }, [open]);

  const onSubmit = async (data: TopUpFormValues) => {
    try {
      const sanitizedData = escapeFormData(data);
      const file = data.file;

      const filePath = `uploads/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("REQUEST_ATTACHMENTS")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        return NextResponse.json(
          { error: "File upload failed.", details: uploadError.message },
          { status: 500 }
        );
      }

      const publicUrl =
        "https://cdn.primepinas.com/storage/v1/object/public/REQUEST_ATTACHMENTS/" +
        filePath;

      await handleDepositRequest({
        TopUpFormValues: sanitizedData,
        publicUrl,
      });

      toast({
        title: "Deposit Request Successfully",
        description: "Please wait for your request to be approved.",
      });

      setOpen(false);
      reset();

      setAddTransactionHistory({
        data: [
          {
            transaction_id: uuidv4(),
            transaction_date: new Date(),
            transaction_description: "Deposit Pending",
            transaction_details: `Account Name: ${sanitizedData.accountName} | Account Number: ${sanitizedData.accountNumber}`,
            transaction_member_id: teamMemberProfile?.alliance_member_id ?? "",
            transaction_amount: Number(sanitizedData.amount),
            transaction_attachment: "",
          },
        ],
        count: 1,
      });
      setCanUserDeposit(true);
    } catch (e) {
      if (e instanceof Error) {
        await logError(supabaseClient, {
          errorMessage: e.message,
          stackTrace: e.stack,
          stackPath:
            "components/DashboardPage/DashboardDepositRequest/DashboardDepositModal/DashboardDepositModalDeposit.tsx",
        });
        toast({
          title: "Error",
          description: e.message,
          variant: "destructive",
        });
      }
    }
  };

  const onTopUpModeChange = (value: string) => {
    const selectedOption = topUpOptions.find(
      (option) => option.merchant_id === value
    );
    if (selectedOption) {
      setValue("accountName", selectedOption.merchant_account_name || "");
      setValue("accountNumber", selectedOption.merchant_account_number || "");
    }
  };

  const selectedOption = watch("topUpMode");

  const uploadedFile = watch("file");

  const handleCopy = (text: string) => {
    if (!text) {
      toast({
        title: "Error",
        description: "Nothing to copy!",
        variant: "destructive",
      });
      return;
    }

    navigator.clipboard.writeText(text);

    toast({
      title: "Copied to clipboard",
    });
  };

  const selectedMerchant = topUpOptions.find(
    (option) => option.merchant_id === selectedOption
  );

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
      <DialogTrigger asChild className={className}>
        {!canUserDeposit ? (
          <Button
            className=" relative h-60 sm:h-80 flex flex-col gap-8 items-start justify-start sm:justify-center sm:items-center pt-8 sm:pt-0 px-4 text-lg sm:text-2xl "
            onClick={() => setOpen(true)}
          >
            <p className="text-lg sm:text-2xl font-bold">Deposit Here </p>
            <div className="flex flex-col items-end justify-start sm:justify-center sm:items-center">
              <Image
                src="/assets/deposit.png"
                alt="deposit"
                width={250}
                height={250}
                className="absolute sm:relative bottom-10 sm:bottom-0 sm:left-0 left-2"
              />
            </div>
          </Button>
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <Button className=" relative h-60 sm:h-80 flex flex-col gap-8 items-start justify-start sm:justify-center sm:items-center pt-8 sm:pt-0 px-4 text-lg sm:text-2xl ">
                Deposit Here
                <div className="flex flex-col items-end justify-start sm:justify-center sm:items-center">
                  <Image
                    src="/assets/deposit.png"
                    alt="deposit"
                    width={250}
                    height={250}
                    className="absolute sm:relative bottom-10 sm:bottom-0 sm:left-0 left-2"
                  />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px]">
              <Alert variant={"destructive"}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Deposit Limit</AlertTitle>
                <AlertDescription className=" text-break">
                  Your Deposit Request is under review. Kindly wait for it to be
                  approved.
                </AlertDescription>
              </Alert>
            </PopoverContent>
          </Popover>
        )}
      </DialogTrigger>
      <DialogContent type="earnings" className="sm:max-w-[425px]">
        <ScrollArea className="h-[500px] sm:h-full">
          <DialogHeader className="text-start text-2xl font-bold">
            <DialogTitle className="flex justify-between items-center gap-2 text-2xl font-bold mb-4">
              Deposit Request
              <DashboardDynamicGuideModal type="deposit" />
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Amount Field */}
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <Input
                    variant="default"
                    type="text"
                    id="amount"
                    className="text-center"
                    placeholder="Deposit Amount"
                    {...field}
                    autoFocus
                    value={field.value}
                    onChange={(e) => {
                      let inputValue = e.target.value;

                      // Allow clearing the value
                      if (inputValue === "") {
                        field.onChange("");
                        return;
                      }

                      // Remove non-numeric characters
                      inputValue = inputValue.replace(/[^0-9.]/g, "");

                      // Ensure only one decimal point
                      const parts = inputValue.split(".");
                      if (parts.length > 2) {
                        inputValue = parts[0] + "." + parts[1];
                      }

                      // Limit to two decimal places
                      if (parts[1]?.length > 2) {
                        inputValue = `${parts[0]}.${parts[1].substring(0, 2)}`;
                      }

                      if (inputValue.length > 8) {
                        inputValue = inputValue.substring(0, 8);
                      }

                      // Update the field value
                      field.onChange(inputValue);

                      // Enforce max amount
                      const numericValue = Number(inputValue);

                      setValue("amount", numericValue.toString());
                    }}
                  />
                )}
              />
              {errors.amount && (
                <p className="text-primaryRed text-sm mt-1">
                  {errors.amount.message}
                </p>
              )}
            </div>

            {/* Top-Up Mode */}
            <div>
              <Label htmlFor="topUpMode">Mode of Payment</Label>
              <Controller
                name="topUpMode"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      onTopUpModeChange(value);
                    }}
                    value={field.value}
                  >
                    <SelectTrigger className="text-center">
                      <SelectValue placeholder="Select Mode of Payment" />
                    </SelectTrigger>
                    <SelectContent>
                      {topUpOptions.map((option) => (
                        <SelectItem
                          key={option.merchant_id}
                          value={option.merchant_id}
                        >
                          {option.merchant_account_type} -{" "}
                          {option.merchant_account_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.topUpMode && (
                <p className="text-primaryRed text-sm mt-1">
                  {errors.topUpMode.message}
                </p>
              )}
            </div>

            {selectedMerchant?.merchant_qr_attachment && (
              <div className="flex flex-col gap-2 justify-center items-center">
                <p className="text-lg font-bold">QR CODE</p>
                <Image
                  src={selectedMerchant.merchant_qr_attachment}
                  alt="QR Code"
                  width={200}
                  height={200}
                />
              </div>
            )}

            {/* Account Details */}
            <div className="flex flex-col gap-4">
              <div className="flex-1">
                <Label htmlFor="accountName">Account Name</Label>
                <div className="flex gap-2">
                  <Controller
                    name="accountName"
                    control={control}
                    render={({ field }) => (
                      <Input
                        className="text-center"
                        readOnly
                        variant="default"
                        id="accountName"
                        placeholder="Account Name"
                        {...field}
                      />
                    )}
                  />
                  <Button
                    type="button"
                    onClick={() => handleCopy(watch("accountName") || "")}
                    className="w-20 bg-pageColor text-white h-12"
                  >
                    Copy
                  </Button>
                </div>
                {errors.accountName && (
                  <p className="text-primaryRed text-sm mt-1">
                    {errors.accountName.message}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <Label htmlFor="accountNumber">Account Number</Label>
                <div className="flex gap-2">
                  <Controller
                    name="accountNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        readOnly
                        className="text-center"
                        id="accountNumber"
                        placeholder="Account Number"
                        {...field}
                      />
                    )}
                  />
                  <Button
                    type="button"
                    onClick={() => handleCopy(watch("accountNumber") || "")}
                    className="w-20 bg-pageColor text-white h-12"
                  >
                    Copy
                  </Button>
                </div>
                {errors.accountNumber && (
                  <p className="text-primaryRed text-sm mt-1">
                    {errors.accountNumber.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Controller
                name="file"
                control={control}
                render={({ field }) => (
                  <FileUpload
                    label="Upload Receipt"
                    onFileChange={(file) => field.onChange(file)}
                  />
                )}
              />
              {uploadedFile && !errors.file && (
                <p className="text-md font-bold text-green-700">
                  {"File Uploaded Successfully"}
                </p>
              )}

              {errors.file && (
                <p className="text-primaryRed text-sm mt-1">
                  {errors.file?.message}
                </p>
              )}
            </div>

            <div className="flex justify-center items-center">
              <Button
                type="submit"
                className=" bg-pageColor text-white h-12 "
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : null}{" "}
                Submit
              </Button>
            </div>
          </form>
          <DialogFooter></DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardDepositModalDeposit;
