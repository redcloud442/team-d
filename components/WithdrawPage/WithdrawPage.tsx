"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const withdrawalFormSchema = z.object({
  earnings: z.string(),
  amount: z
    .string()
    .min(1, "Amount is required")
    .regex(/^\d+$/, "Amount must be a number"),
  bank: z.string().min(1, "Please select a bank"),
  accountName: z.string().min(6, "Account name is required"),
  accountNumber: z.string().min(6, "Account number is required"),
});

type WithdrawalFormValues = z.infer<typeof withdrawalFormSchema>;

const bankData = ["GCASH", "MAYA", "GOTYME", "UNIONBANK", "BDO", "BPI"];

const WithdrawalPage = () => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalFormSchema),
    defaultValues: {
      earnings: "",
      amount: "",
      bank: "",
      accountName: "",
      accountNumber: "",
    },
  });

  const onSubmit = (data: WithdrawalFormValues) => {
    const sanitizedData = escapeFormData(data);

    console.log(sanitizedData);
  };

  return (
    <div className="flex flex-col items-center min-h-screen ">
      <div className="w-full max-w-md px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-center scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-3xl">
              WITHDRAWAL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                        <SelectItem value="TOTAL">TOTAL</SelectItem>
                        <SelectItem value="ALLY AND LEGION">
                          ALLY AND LEGION
                        </SelectItem>
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

              <div>
                <Label htmlFor="accountName">Account Name</Label>
                <Controller
                  name="accountName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
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
              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Controller
                  name="accountNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
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
                      />
                    )}
                  />
                  <Button
                    type="button"
                    className="ml-2 bg-blue-500 text-white"
                    onClick={() => setValue("amount", "MAX")}
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

              <Button type="submit" className="w-full ">
                ENTER
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WithdrawalPage;
