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
import SelectField from "@/components/ui/select-component";
import { useToast } from "@/hooks/use-toast";
import { handleDepositRequest } from "@/services/TopUp/Member";
import { useUserHaveAlreadyWithdraw } from "@/store/useWithdrawalToday";
import { useRole } from "@/utils/context/roleContext";
import { escapeFormData } from "@/utils/function";
import { DepositRequestFormValues, depositRequestSchema } from "@/utils/schema";
import { createClientSide } from "@/utils/supabase/client";
import { merchant_table } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import QRViewer from "./QRViewer";

const DashboardDepositModalDeposit = ({
  options: topUpOptions,
}: {
  options: merchant_table[];
}) => {
  const router = useRouter();
  const supabaseClient = createClientSide();
  const queryClient = useQueryClient();

  const [selectedMop, setSelectedMop] = useState<merchant_table | null>(null);

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

  const onTopUpModeChange = (value: string) => {
    const selectedOption = topUpOptions.find(
      (option) => option.merchant_id === value
    );
    if (selectedOption) {
      setSelectedMop(selectedOption);
      setValue("accountName", selectedOption.merchant_account_name || "");
      setValue("accountNumber", selectedOption.merchant_account_number || "");
    }
  };

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    toast({
      title: "Copied to clipboard",
    });
  };

  return (
    <div className="w-full flex flex-col gap-2 justify-center items-center">
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 w-full max-w-md sm:max-w-4xl"
        >
          <SelectField
            name="topUpMode"
            control={control}
            onChange={onTopUpModeChange}
            options={topUpOptions.map((option) => ({
              label:
                option.merchant_account_name +
                " - " +
                option.merchant_account_number +
                " - " +
                option.merchant_account_type,
              value: option.merchant_id,
            }))}
          />

          {selectedMop &&
            selectedMop.merchant_qr_attachment !== "" &&
            selectedMop.merchant_qr_attachment !== null && (
              <QRViewer qrImageSrc={selectedMop.merchant_qr_attachment || ""} />
            )}

          <div className="border-2 border-bg-primary-blue rounded-md p-4">
            <FormField
              control={control}
              name="accountName"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel className="space-x-1 text-xl font-normal text-bg-primary-blue">
                    Account Name:
                  </FormLabel>
                  <div className="flex gap-2 w-full justify-between">
                    <FormControl>
                      <Input
                        readOnly
                        className="w-full bg-transparent text-white text-xl dark:placeholder:text-white border-none placeholder:text-xl"
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
                  <FormLabel className="space-x-1 text-xl font-normal text-bg-primary-blue">
                    {selectedMop?.merchant_account_type ?? "Account Number"}
                  </FormLabel>
                  <div className="flex gap-2 w-full justify-between">
                    <FormControl>
                      <Input
                        readOnly
                        className="w-full bg-transparent text-white text-xl dark:placeholder:text-white border-none placeholder:text-xl"
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
          </div>
          <FormField
            control={control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Amount"
                    className=" bg-teal-600 text-white dark:placeholder:text-white w-full border-none h-16 text-xl placeholder:text-xl"
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
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="file"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl font-normal text-start">
                  Upload Proof of Payment
                </FormLabel>
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

          <Button
            className=" font-black p-4 w-full h-12 text-xl"
            disabled={isSubmitting || !canUserDeposit}
            type="submit"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : null} Submit
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default DashboardDepositModalDeposit;
