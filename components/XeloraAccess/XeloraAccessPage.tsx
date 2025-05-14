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
import { useRef, useState } from "react";
import {
  Resolver,
  ResolverOptions,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { BoundTurnstileObject } from "react-turnstile";
import ReusableCard from "../ui/card-reusable";
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

const XeloraAccess = () => {
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
    <ReusableCard className="p-10 space-y-4" title="Welcome to Xelora Access!">
      {step === "login" ? (
        <Form {...form}>
          <form
            className="flex flex-col gap-6 w-full z-40"
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
                variant="card"
                className=" font-black text-2xl rounded-full p-5"
                disabled={isSubmitting || isLoading}
                type="submit"
              >
                {isSubmitting || isLoading ? "Processing..." : "Login"}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <Form {...form}>
          <form
            className="flex flex-col gap-6 w-full z-40"
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

            <div className="w-full flex justify-center">
              <Button
                variant="card"
                className=" font-black text-2xl rounded-full p-5"
                disabled={isSubmitting || isLoading}
                type="submit"
              >
                {isSubmitting || isLoading ? "Processing..." : "Verify OTP"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </ReusableCard>
  );
};

export default XeloraAccess;
