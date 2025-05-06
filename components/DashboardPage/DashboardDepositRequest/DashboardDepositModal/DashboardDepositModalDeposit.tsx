import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FileUpload from "@/components/ui/dropZone";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { BANK_IMAGE } from "@/utils/constant";
import { escapeFormData } from "@/utils/function";
import { DepositRequestFormValues, depositRequestSchema } from "@/utils/schema";
import { createClientSide } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { company_member_table, merchant_table } from "@prisma/client";
import { AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { NextResponse } from "next/server";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import DashboardDynamicGuideModal from "../DashboardDynamicGuideModal/DashboardDynamicGuideModal";

type Props = {
  teamMemberProfile: company_member_table;
  className: string;
};

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

  const form = useForm<DepositRequestFormValues>({
    resolver: zodResolver(depositRequestSchema),
    defaultValues: {
      amount: "",
      topUpMode: "",
      accountName: "",
      accountNumber: "",
      file: undefined,
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { isSubmitting },
  } = form;

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

  const onSubmit = async (data: DepositRequestFormValues) => {
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
            company_transaction_id: uuidv4(),
            company_transaction_date: new Date(),
            company_transaction_description: "Deposit Pending",
            company_transaction_details: `Account Name: ${sanitizedData.accountName} | Account Number: ${sanitizedData.accountNumber}`,
            company_transaction_member_id:
              teamMemberProfile?.company_member_id ?? "",
            company_transaction_amount: Number(sanitizedData.amount),
            company_transaction_attachment: "",
            company_transaction_type: "DEPOSIT",
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

  //   const selectedOption = watch("topUpMode");

  //   const selectedMerchant = topUpOptions.find(
  //     (option) => option.merchant_id === selectedOption
  //   );

  //   const uploadedFile = watch("file");

  //   const amountTotal = Number(watch("amount") || 0) + bonusAmount;

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
            className=" relative h-60 sm:h-80 flex flex-col gap-2 items-start justify-start sm:justify-center sm:items-center pt-8 sm:pt-0 px-4 text-lg sm:text-2xl animate-tracing-border-2"
            onClick={() => setOpen(true)}
          >
            <p className="text-lg sm:text-2xl font-bold">Deposit Here </p>

            <div className="flex flex-col items-end justify-start sm:justify-center sm:items-center">
              <Image
                src="/assets/deposit.png"
                alt="deposit"
                width={250}
                height={250}
                className="relative sm:relative bottom-0 left-0 mx-auto"
              />
            </div>
          </Button>
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <Button className=" relative h-60 sm:h-80 flex flex-col gap-2 items-start justify-start sm:justify-center sm:items-center pt-8 sm:pt-0 px-4 text-lg sm:text-2xl animate-tracing-border-2 ">
                <p className="text-lg sm:text-2xl font-bold">Deposit Here </p>

                <div className="flex flex-col items-end justify-start sm:justify-center sm:items-center">
                  <Image
                    src="/assets/deposit.png"
                    alt="deposit"
                    width={250}
                    height={250}
                    className="relative sm:relative bottom-0 left-0 mx-auto"
                  />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px]">
              <Alert variant={"destructive"}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Deposit Limit</AlertTitle>
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
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Amount Field */}
              <FormField
                control={control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Amount"
                        {...field}
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
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="topUpMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mode of Payment</FormLabel>
                    <FormControl>
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
                              <div className="flex items-center gap-2">
                                <Image
                                  src={
                                    BANK_IMAGE[
                                      option.merchant_account_type as keyof typeof BANK_IMAGE
                                    ]
                                  }
                                  alt={option.merchant_account_type}
                                  width={40}
                                  height={40}
                                />
                                {option.merchant_account_type} -{" "}
                                {option.merchant_account_name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* {selectedMerchant?.merchant_qr_attachment && (
                <div className="flex flex-col gap-2 justify-center items-center">
                  <p className="text-lg font-bold">QR CODE</p>
                  <Image
                    src={selectedMerchant.merchant_qr_attachment}
                    alt="QR Code"
                    width={200}
                    height={200}
                  />
                </div>
              )} */}

              <div className="flex flex-col gap-4">
                <FormField
                  control={control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name</FormLabel>
                      <FormControl>
                        <Input
                          className="text-center"
                          readOnly
                          variant="default"
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
                          readOnly
                          className="text-center"
                          id="accountNumber"
                          placeholder="Account Number"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        onClick={() => handleCopy(watch("accountNumber") || "")}
                        className="w-20 bg-pageColor text-white h-12"
                      >
                        Copy
                      </Button>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Receipt</FormLabel>
                    <FormControl>
                      <FileUpload
                        label="Upload Receipt"
                        onFileChange={(file) => field.onChange(file)}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className=" bg-pageColor text-white h-12 w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : null}{" "}
                Submit
              </Button>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardDepositModalDeposit;
