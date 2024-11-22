"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { escapeFormData } from "@/utils/function";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import FileUpload from "../ui/dropZone";

const topUpFormSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .regex(/^\d+$/, "Amount must be a number"),
  topUpMode: z.string().min(1, "Top up mode is required"),
  accountName: z.string().min(1, "Field is required"),
  accountNumber: z.string().min(1, "Field is required"),
  file: z
    .instanceof(File)
    .refine((file) => !!file, { message: "File is required" }), // File upload validation
});

type TopUpFormValues = z.infer<typeof topUpFormSchema>;

const TopUpPage = () => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TopUpFormValues>({
    resolver: zodResolver(topUpFormSchema),
    defaultValues: {
      amount: "",
      topUpMode: "GCASH",
      accountName: "Test User 1",
      accountNumber: "1234567890",
      file: undefined,
    },
  });

  const onSubmit = (data: TopUpFormValues) => {
    try {
      const sanitizedData = escapeFormData(data);
      console.log(sanitizedData);
    } catch (e) {
      console.log(e);
    }
  };

  const onTopUpModeChange = (value: string) => {
    if (value === "GCASH") {
      setValue("accountName", "Test User 1");
      setValue("accountNumber", "1234567890");
    } else if (value === "GOTYME") {
      setValue("accountName", "Test User 2");
      setValue("accountNumber", "987654321");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="w-full max-w-md px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-center scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-3xl">
              REGENERATE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="amount">Enter Amount</Label>
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      id="amount"
                      placeholder="Enter amount"
                      {...field}
                    />
                  )}
                />
                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.amount.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="topUpMode">Select Top Up Mode</Label>
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
                      <SelectTrigger>
                        <SelectValue placeholder="Top Up Mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GCASH">GCASH</SelectItem>
                        <SelectItem value="GOTYME">GOTYME</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.topUpMode && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.topUpMode.message}
                  </p>
                )}
              </div>

              {/* Account Details */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Controller
                    name="accountName"
                    control={control}
                    render={({ field }) => (
                      <Input
                        readOnly
                        id="accountName"
                        placeholder="Name"
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
                <div className="flex-1">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Controller
                    name="accountNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        readOnly
                        id="accountNumber"
                        placeholder="Account number"
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
              </div>

              <div>
                <Controller
                  name="file"
                  control={control}
                  render={({ field }) => (
                    <FileUpload
                      label="Upload File"
                      onFileChange={(file) => field.onChange(file)}
                    />
                  )}
                />
                {errors.file && (
                  <p className="text-red-500 text-sm mt-1">
                    {typeof errors.file === "string"
                      ? errors.file
                      : errors.file?.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" variant="default">
                Submit
              </Button>
            </form>
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default TopUpPage;
