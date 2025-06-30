// app/components/LoginDialog.tsx

"use client";

import { checkCode } from "@/services/Auth/Auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

type FormType = { code: string };

const codeSchema = z.object({
  code: z.coerce
    .string()
    .min(6, "Code must be 6 characters long")
    .max(8, "Code must be 8 characters long")
    .regex(/^[A-Za-z0-9]{6,8}$/, "Code must be letters or numbers")
    .trim(),
});

const LoginDialog = () => {
  const router = useRouter();
  const form = useForm<FormType>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
  });

  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  const {
    data: codeData,
    isFetching,
    isSuccess,
    error,
  } = useQuery({
    queryKey: ["checkCode", submittedCode],
    queryFn: () => checkCode({ code: submittedCode ?? "" }),
    enabled: !!submittedCode,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 2,
    retry: (failureCount, err: Error) => err.message !== "Invalid code.",
  });

  const onSubmit = (values: FormType) => {
    try {
      setSubmittedCode(values.code);

      form.reset();

      setTimeout(() => {
        router.push(codeData?.referralLink ?? "");
      }, 1000);
    } catch (error) {
      setSubmittedCode(null);
      form.reset();
      form.setError("code", { message: "Invalid code" });
    }
  };

  useEffect(() => {
    if (!codeData?.referralLink) return;
    if (codeData?.referralLink) {
      setTimeout(() => {
        router.push(codeData?.referralLink);
      }, 1000);
    }
  }, [codeData?.referralLink]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="rounded-sm font-black p-4">Register Via Code</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register Via Code</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} placeholder="Enter Code" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isFetching}>
              {isFetching ? "Checking…" : "Validate Code"}
            </Button>

            {isSuccess && (
              <span className="text-sm text-green-600">Code accepted ✔</span>
            )}
            {error && (
              <span className="text-sm text-red-500">
                {(error as Error).message}
              </span>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
