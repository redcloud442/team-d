"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { handleSignInAdmin } from "@/services/Auth/Auth";
import { escapeFormData, userNameToEmail } from "@/utils/function";
import {
  LoginFormValues,
  LoginSchema,
  OtpFormValues,
  OtpSchema,
} from "@/utils/schema";
import { createClientSide } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRef, useState } from "react";
import {
  Resolver,
  ResolverOptions,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { BoundTurnstileObject } from "react-turnstile";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp";
import { PasswordInput } from "../ui/passwordInput";

const DigiAuth = () => {
  const [step, setStep] = useState<"login" | "verify">("login");
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captcha = useRef<BoundTurnstileObject>(null);

  const unionResolver: Resolver<LoginFormValues | OtpFormValues> = async (
    values,
    context,
    options
  ) => {
    if (step === "login") {
      return zodResolver(LoginSchema)(
        values as LoginFormValues,
        context,
        options as ResolverOptions<LoginFormValues>
      );
    } else {
      return zodResolver(OtpSchema)(
        values as OtpFormValues,
        context,
        options as ResolverOptions<OtpFormValues>
      );
    }
  };

  const form = useForm<LoginFormValues | OtpFormValues>({
    resolver: unionResolver,
    defaultValues: {
      userName: "",
      password: "",
      otp: "",
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
    control,
  } = form;

  const supabase = createClientSide();
  const { toast } = useToast();

  const handleSignIn = async (data: LoginFormValues) => {
    try {
      // if (!captchaToken) {
      //   return toast({
      //     title: "Please wait",
      //     description: "Captcha is required.",
      //     variant: "destructive",
      //   });
      // }
      setIsLoading(true);

      const sanitizedData = escapeFormData(data);

      const validation = LoginSchema.safeParse(sanitizedData);

      if (!validation.success) {
        toast({ title: "Invalid input", variant: "destructive" });
        return;
      }

      const { userName, password } = sanitizedData;

      const result = await handleSignInAdmin({ userName, password });

      if (!result.ok) {
        toast({ title: "Not Allowed", variant: "destructive" });
        return;
      }

      const userEmail = userNameToEmail(userName);

      setEmail(userEmail);

      const sanitizedEmail = userEmail.trim().replace(/["\\]/g, "");
      const { error } = await supabase.auth.signInWithOtp({
        email: sanitizedEmail,
        options: { captchaToken: captchaToken || "" },
      });

      if (captcha.current) {
        captcha.current.reset();
      }
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
          title: e.message,
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

      toast({ title: "Successfully logged in!" });

      window.location.href = "/admin";
    } catch (e) {
      if (e instanceof Error) {
        toast({ title: "Invalid OTP", variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Image
        src="/assets/bg/LoginBg.webp"
        alt="Digi Wealth Logo"
        width={220}
        height={220}
        priority
        className="absolute bottom-0 right-0 object-cover z-30"
      />

      <Image
        src="/assets/bg/LoginBg.webp"
        alt="Digi Wealth Logo"
        width={220}
        height={220}
        priority
        className="absolute top-0 left-0 object-cover z-30 rotate-180"
      />
      <div className="relative z-50 w-full flex flex-col items-center space-y-2 pb-10">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center">
          <Image
            src="/assets/icons/IconGif.webp"
            alt="DigiWealth Logo"
            width={150}
            height={150}
            className="w-40 h-auto"
            priority
          />

          {/* Title */}
          <div className="flex items-center justify-center">
            <span className="text-xl font-black text-bg-primary-blue">
              DIGI
            </span>
            <span className="text-xl font-black text-white">AUTH</span>
          </div>
          <div className="flex items-center justify-center text-white space-x-1">
            <span className="text-md font-black">Create</span>
            <span className="text-md text-bg-primary-blue font-black">
              Wealth
            </span>
            <span className="text-md font-black">through</span>
            <span className="text-md font-black text-bg-primary-blue  ">
              Digital
            </span>
          </div>
        </div>

        {step === "login" ? (
          <Form {...form}>
            <form
              className="w-full space-y-4 max-w-3xs z-50"
              onSubmit={handleSubmit(
                handleSignIn as SubmitHandler<LoginFormValues | OtpFormValues>
              )}
            >
              <FormField
                control={control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        variant="non-card"
                        id="username"
                        placeholder="Username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        variant="non-card"
                        id="password"
                        placeholder="Password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <Turnstile
              size="flexible"
              sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""}
              onVerify={(token) => {
                setCaptchaToken(token);
              }}
            /> */}
              <div className="w-full flex justify-center">
                <Button
                  className="rounded-sm font-black p-4"
                  disabled={isSubmitting || isLoading}
                  type="submit"
                >
                  {isSubmitting || isLoading ? "Processing..." : "LOGIN"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...form}>
            <form
              className="flex flex-col items-center gap-6 w-full z-40"
              onSubmit={handleSubmit(
                handleVerifyOtp as SubmitHandler<
                  LoginFormValues | OtpFormValues
                >
              )}
            >
              <FormField
                control={control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OTP</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="w-full flex justify-center">
                <Button
                  className="rounded-sm font-black p-4"
                  disabled={isSubmitting || isLoading}
                  type="submit"
                >
                  {isSubmitting || isLoading ? "Processing..." : "Verify OTP"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </>
  );
};

export default DigiAuth;
