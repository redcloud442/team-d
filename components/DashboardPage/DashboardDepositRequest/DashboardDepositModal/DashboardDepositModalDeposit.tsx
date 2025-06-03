"use client";

import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Gcash from "@/public/assets/svg/gcash";
import GoTyme from "@/public/assets/svg/gotyme";
import Mayab from "@/public/assets/svg/mayab";
import { handleDepositRequest } from "@/services/TopUp/Member";
import { useUserEarningsStore } from "@/store/useUserEarningsStore";
import { useUserHaveAlreadyWithdraw } from "@/store/useWithdrawalToday";
import { useRole } from "@/utils/context/roleContext";
import { escapeFormData, formatNumberLocale } from "@/utils/function";
import { DepositRequestFormValues, depositRequestSchema } from "@/utils/schema";
import { createClientSide } from "@/utils/supabase/client";
import { merchant_table } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

const DashboardDepositModalDeposit = ({
  options: topUpOptions,
}: {
  options: merchant_table[];
}) => {
  const router = useRouter();
  const supabaseClient = createClientSide();
  const queryClient = useQueryClient();
  const [selectedBank, setSelectedBank] = useState<merchant_table | null>(null);

  const { earnings } = useUserEarningsStore();
  const { teamMemberProfile } = useRole();
  const { canUserDeposit, setCanUserDeposit } = useUserHaveAlreadyWithdraw();

  const { toast } = useToast();

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
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: DepositRequestFormValues) => {
    try {
      if (!canUserDeposit) {
        toast({
          title: "Error",
          description: "You have already deposited today.",
          variant: "destructive",
        });
        return;
      }
      const sanitizedData = escapeFormData(data);
      const file = data.file;

      const filePath = `uploads/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("REQUEST_ATTACHMENTS")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw new Error("File upload failed.");
      }

      const publicUrl = `https://cdn.digi-wealth.vip/storage/v1/object/public/REQUEST_ATTACHMENTS/${filePath}`;

      await handleDepositRequest({
        TopUpFormValues: sanitizedData,
        publicUrl,
      });

      toast({
        title: "Request Successfully Submitted",
        description: "You will be redirected shortly",
      });

      reset();

      setCanUserDeposit(false);

      queryClient.invalidateQueries({
        queryKey: [
          "transaction-history",
          "DEPOSIT",
          teamMemberProfile?.company_member_id,
        ],
      });

      setTimeout(() => {
        router.push("/digi-dash");
      }, 1000);
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

  const options = topUpOptions.filter(
    (option) =>
      selectedBank?.merchant_account_type === option.merchant_account_type
  );

  const onTopUpModeChange = (value: string) => {
    const selectedOption = options.find(
      (option) => option.merchant_id === value
    );
    if (selectedOption) {
      setValue("accountName", selectedOption.merchant_account_name || "");
      setValue("accountNumber", selectedOption.merchant_account_number || "");
    }
  };

  const handleSelectedBank = (value: string) => {
    const selectedOption = topUpOptions.find(
      (option) => option.merchant_id === value
    );
    if (selectedOption) {
      setSelectedBank(selectedOption);
    }
  };

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    toast({
      title: "Copied to clipboard",
    });
  };

  const bankimages = (value: string) => {
    switch (value) {
      case "GCASH":
        return <Gcash />;
      case "GOTYME":
        return <GoTyme />;
      case "MAYA BUSINESS":
        return <Mayab />;
      default:
        return <Gcash />;
    }
  };

  return (
    <div className="w-full flex flex-col gap-2 justify-center items-center">
      <div className="flex flex-col items-center gap-2 border-3 p-2 border-bg-primary-blue rounded-full w-full max-w-md">
        <h1 className="text-2xl font-bold text-bg-primary-blue">
          AVAILABLE BALANCE
        </h1>
        <span className="text-2xl font-black">
          ₱ {formatNumberLocale(earnings?.company_combined_earnings ?? 0)}
        </span>
      </div>
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 w-full max-w-md sm:max-w-4xl"
        >
          {/* Amount Field */}
          <div className="text-xl font-bold">
            <span className="text-bg-primary-blue"> 1. SELECT</span> BANK
          </div>
          <div className="grid grid-cols-3 gap-4 mt-2">
            {topUpOptions.map((option) => {
              return (
                <button
                  key={option.merchant_id}
                  type="button"
                  onClick={() => {
                    handleSelectedBank(option.merchant_id);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl p-2 transition-all",
                    selectedBank &&
                      " border-2 border-bg-primary-blue bg-bg-primary/10"
                  )}
                >
                  {/* Logo */}

                  {bankimages(option.merchant_account_type)}

                  {/* Select Button */}
                  <span
                    className={cn(
                      "mt-1 px-2 py-1 rounded-md text-xs font-bold",
                      selectedBank
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
          <div className="text-xl font-bold">
            <span className="text-bg-primary-blue"> 2. SELECT</span>
            <span> DIGIWealth MOP</span>
          </div>

          <FormField
            control={control}
            name="topUpMode"
            render={({ field }) => (
              <FormItem className="flex justify-between items-center">
                <FormLabel className="space-x-1">
                  <span className="text-bg-primary-blue">-</span>
                  <span>SELECT MOP</span>
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      onTopUpModeChange(value);
                    }}
                    value={field.value}
                  >
                    <SelectTrigger className="text-center w-fit h-6 rounded-lg">
                      <SelectValue placeholder="Select MOP Account" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((option, index) => (
                        <SelectItem
                          key={option.merchant_id}
                          value={option.merchant_id}
                        >
                          <div className="flex items-center gap-2">
                            {index + 1}. {option.merchant_account_name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="accountName"
            render={({ field }) => (
              <FormItem className="flex flex-col items-start">
                <FormLabel className="space-x-1">
                  <span className="text-bg-primary-blue">-</span>
                  <span>Account Name</span>
                </FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Input
                      readOnly
                      variant="non-card"
                      className="w-fit bg-bg-primary-blue text-black dark:placeholder:text-black"
                      id="accountName"
                      placeholder="Account Name:"
                      {...field}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    onClick={() => handleCopy(field.value)}
                    className="p-4 rounded-lg"
                  >
                    COPY
                  </Button>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="accountNumber"
            render={({ field }) => (
              <FormItem className="flex flex-col items-start">
                <FormLabel className="space-x-1">
                  <span className="text-bg-primary-blue">-</span>
                  <span>Account Number</span>
                </FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Input
                      readOnly
                      className="w-fit bg-bg-primary-blue text-black dark:placeholder:text-black"
                      variant="non-card"
                      id="accountNumber"
                      placeholder="Account Number"
                      {...field}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(field.value);
                    }}
                    className="p-4 rounded-lg"
                  >
                    COPY
                  </Button>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="amount"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <FormLabel className="space-x-1">
                  <span className="text-bg-primary-blue">-</span>
                  <span>Amount to Send</span>
                </FormLabel>
                <div className="flex flex-col items-center gap-2">
                  <FormControl>
                    <Input
                      placeholder="Amount:"
                      className="w-fit bg-bg-primary-blue text-black dark:placeholder:text-black"
                      variant="non-card"
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
                </div>
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
          <div className="text-xl font-bold">
            <span className="text-bg-primary-blue"> 3. UPLOAD</span>
            <span> YOUR RECEIPT</span>
          </div>

          <FormField
            control={control}
            name="file"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FileUpload
                    label=""
                    onFileChange={(file) => field.onChange(file)}
                  />
                </FormControl>
                <FormMessage className="text-center" />
              </FormItem>
            )}
          />
          {/* {file && (
          <h1 className="rounded-md h-10 w-full border-2 border-orange-500 bg-orange-950 flex items-center justify-center text-green-500">
            FILE UPLOADED SUCCESSFULLY
          </h1>
        )} */}
          <div className="w-full flex justify-center">
            <Button
              className=" font-black  p-4"
              disabled={isSubmitting || !canUserDeposit}
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

export default DashboardDepositModalDeposit;
