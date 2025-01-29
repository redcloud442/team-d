"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { loginValidation } from "@/services/Auth/Auth";
import { logError } from "@/services/Error/ErrorLogs";
import { escapeFormData } from "@/utils/function";
import { createClientSide } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import NavigationLoader from "../ui/NavigationLoader";

// Zod Schema for Login Form
export const LoginSchema = z.object({
  userName: z
    .string()
    .min(6, "Username must be at least 6 characters long")
    .max(20, "Username must be at most 20 characters long")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof LoginSchema>;

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
  });

  const router = useRouter();
  const supabase = createClientSide();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSignIn = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      const sanitizedData = escapeFormData(data);

      const { userName, password } = sanitizedData;

      await loginValidation(supabase, {
        userName,
        password,
      });

      toast({
        title: "Login Successfully",
        description: "Redirecting to dashboard...",
      });

      setIsSuccess(true);
      router.push("/");
    } catch (e) {
      if (e instanceof Error) {
        await logError(supabase, {
          errorMessage: e.message,
          stackTrace: e.stack,
          stackPath:
            "components/AdminTopUpApprovalPage/AdminTopUpApprovalColumn.tsx",
        });
      }
      toast({
        title: "Check user credentials",
        description: "Invalid username or password",
        variant: "destructive",
      });

      setIsLoading(false); // Stop loader on error
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center sm:justify-center min-h-screen h-full p-10">
      <NavigationLoader visible={isSubmitting || isLoading || isSuccess} />

      <div className="fixed top-20 -right-6  z-10 ">
        <Image
          src="/assets/lightning-2.svg"
          alt="thunder"
          width={300}
          height={300}
          style={{
            objectFit: "contain",
          }}
          quality={100}
          className="sm:hidden"
        />
      </div>

      <div className="fixed -top-12 z-10">
        <Image
          src="/assets/lightning.svg"
          alt="thunder"
          width={300}
          height={300}
          quality={100}
          className="w-full sm:hidden"
        />
      </div>

      <div className="absolute top-[20%] sm:top-[35%] flex items-center justify-center w-full">
        <Image src="/app-logo.svg" alt="logo" width={120} height={120} />
      </div>
      <form
        className="flex flex-col items-center gap-6 w-full max-w-lg m-4 z-40"
        onSubmit={handleSubmit(handleSignIn)}
      >
        <div className="w-full">
          <Input
            variant="non-card"
            id="username"
            placeholder="Username"
            {...register("userName")}
          />
          {errors.userName && (
            <p className="text-sm text-red-500">{errors.userName.message}</p>
          )}
        </div>
        <div className="w-full">
          <Input
            variant="non-card"
            id="password"
            type="password"
            placeholder="Password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <Button
          disabled={isSubmitting || isLoading}
          type="submit"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit(handleSignIn);
            }
          }}
        >
          {isSubmitting || isLoading ? "Processing..." : "Login"}
        </Button>
      </form>

      <Image
        src="/assets/login-page.png"
        alt="background"
        width={1200}
        height={1200}
        style={{
          objectFit: "none", // Keeps the original size without scaling
        }}
        quality={100}
        priority={true}
        className="hidden sm:block fixed bottom-64 left-[40%] -rotate-45 z-10 w-full h-full"
      />
    </div>
  );
};

export default LoginPage;
