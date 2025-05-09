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
import Turnstile, { BoundTurnstileObject } from "react-turnstile";
import NavigationLoader from "../ui/NavigationLoader";
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

const Pr1meSecured = () => {
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
      if (!captchaToken) {
        return toast({
          title: "Please wait",
          description: "Captcha is required.",
          variant: "destructive",
        });
      }
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
    <div className="flex w-full flex-col items-center justify-center sm:justify-center min-h-screen h-full p-10">
      <NavigationLoader visible={isSubmitting || isLoading} />

      {step === "login" ? (
        <Form {...form}>
          <form
            className="flex flex-col items-center gap-6 w-full max-w-lg m-4 z-40"
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

            <Turnstile
              size="flexible"
              sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""}
              onVerify={(token) => {
                setCaptchaToken(token);
              }}
            />
            <Button disabled={isSubmitting || isLoading} type="submit">
              {isSubmitting || isLoading ? "Sending OTP..." : "Login"}
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...form}>
          <form
            className="flex flex-col items-center gap-6 w-full max-w-lg m-4 z-40"
            onSubmit={handleSubmit(
              handleVerifyOtp as SubmitHandler<LoginFormValues | OtpFormValues>
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

            <Button disabled={isSubmitting || isLoading} type="submit">
              {isSubmitting || isLoading ? "Verifying OTP..." : "Verify OTP"}
            </Button>
          </form>
        </Form>
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
