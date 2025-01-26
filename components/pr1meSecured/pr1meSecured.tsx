"use client";

import { handleSigninAdmin } from "@/app/actions/auth/authAction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { escapeFormData, userNameToEmail } from "@/utils/function";
import { createClientSide } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useState } from "react";
import { FieldErrors, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import NavigationLoader from "../ui/NavigationLoader";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp";
import { Label } from "../ui/label";
import { PasswordInput } from "../ui/passwordInput";

// Zod Schema for Login Form
export const LoginSchema = z.object({
  userName: z
    .string()
    .min(6, "Username must be at least 6 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Zod Schema for OTP Form
export const OtpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

type LoginFormValues = z.infer<typeof LoginSchema>;
type OtpFormValues = z.infer<typeof OtpSchema>;

const Pr1meSecured = () => {
  const [step, setStep] = useState<"login" | "verify">("login");
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormValues | OtpFormValues>({
    resolver: zodResolver(step === "login" ? LoginSchema : OtpSchema),
  });

  const supabase = createClientSide();
  const { toast } = useToast();

  const handleSignIn = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);

      const sanitizedData = escapeFormData(data);

      const validation = LoginSchema.safeParse(sanitizedData);

      if (!validation.success) {
        toast({
          title: "Invalid input",
          variant: "destructive",
        });
        return;
      }

      const { userName, password } = sanitizedData;

      const result = await handleSigninAdmin({ userName, password });

      if (!result.success) {
        toast({
          title: "Not Allowed",
          variant: "destructive",
        });
        return;
      }

      const userEmail = userNameToEmail(userName);

      setEmail(userEmail);

      const { error } = await supabase.auth.signInWithOtp({
        email: userEmail,
      });

      if (error) throw new Error("Invalid username or password");

      toast({
        title: "OTP sent to your email",
        description: `Check your inbox for the OTP.`,
      });

      setStep("verify");
      reset();
    } catch (e) {
      if (e instanceof Error) {
        toast({
          title: "Invalid username or password",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (data: OtpFormValues) => {
    try {
      setIsLoading(true);

      if (!email) {
        throw new Error("Email is missing. Please try logging in again.");
      }

      const { otp } = data;

      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) throw new Error("Invalid OTP");

      toast({
        title: "Successfully logged in!",
      });

      window.location.href = "/admin";
    } catch (e) {
      if (e instanceof Error) {
        toast({
          title: "Invalid OTP",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center sm:justify-center min-h-screen h-full p-10">
      <NavigationLoader visible={isSubmitting || isLoading} />

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

      <div className="fixed top-[16%]  left-54 sm:relative sm:top-0 sm:left-0 ">
        <Image src="/app-logo.svg" alt="logo" width={120} height={120} />
      </div>
      {step === "login" ? (
        <form
          className="flex flex-col items-center gap-6 w-full max-w-lg m-4 z-40"
          onSubmit={handleSubmit(
            handleSignIn as SubmitHandler<
              { userName: string } | { otp: string }
            >
          )}
        >
          <div className="w-full">
            <Input
              variant="non-card"
              id="username"
              placeholder="Username"
              {...register("userName")}
            />
            {(errors as FieldErrors<LoginFormValues>).userName && (
              <p className="text-sm text-primaryRed">
                {(errors as FieldErrors<LoginFormValues>).userName?.message}
              </p>
            )}
          </div>
          <div className="w-full">
            <PasswordInput
              variant="non-card"
              id="password"
              placeholder="Password"
              {...register("password")}
            />
            {(errors as FieldErrors<LoginFormValues>).password && (
              <p className="text-sm text-primaryRed">
                {(errors as FieldErrors<LoginFormValues>).password?.message}
              </p>
            )}
          </div>

          <Button disabled={isSubmitting || isLoading} type="submit">
            {isSubmitting || isLoading ? "Sending OTP..." : "Login"}
          </Button>
        </form>
      ) : (
        <form
          className="flex flex-col items-center gap-6 w-full max-w-lg m-4 z-40"
          onSubmit={handleSubmit(
            handleVerifyOtp as SubmitHandler<
              { userName: string } | { otp: string }
            >
          )}
        >
          <div className="w-full justify-center items-center flex flex-col gap-2">
            <Label className="dark:text-white" htmlFor="otp">
              Enter OTP
            </Label>
            <InputOTP
              maxLength={6}
              value={watch("otp")}
              onChange={(value) => setValue("otp", value)}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            {(errors as FieldErrors<OtpFormValues>).otp && (
              <p className="text-sm text-primaryRed">
                {(errors as FieldErrors<OtpFormValues>).otp?.message}
              </p>
            )}
          </div>
          <Button disabled={isSubmitting || isLoading} type="submit">
            {isSubmitting || isLoading ? "Verifying OTP..." : "Verify OTP"}
          </Button>
        </form>
      )}
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

export default Pr1meSecured;
