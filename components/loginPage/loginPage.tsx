"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { loginValidation } from "@/services/Auth/Auth";
import { escapeFormData } from "@/utils/function";
import { LoginFormValues, LoginSchema } from "@/utils/schema";
import { createClientSide } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { BoundTurnstileObject } from "react-turnstile";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { PasswordInput } from "../ui/passwordInput";
import LoginDialog from "./loginDialog";

const LoginPage = () => {
  const captcha = useRef<BoundTurnstileObject>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      userName: "",
      password: "",
    },
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = form;

  const router = useRouter();
  const supabase = createClientSide();
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleSignIn = async (data: LoginFormValues) => {
    try {
      // if (!captchaToken) {
      //   if (captcha.current) {
      //     captcha.current.reset();
      //     captcha.current.execute();
      //   }

      //   return;
      // }
      const sanitizedData = escapeFormData(data);

      const { userName, password } = sanitizedData;

      await loginValidation(supabase, {
        userName,
        password,
        captchaToken: captchaToken || "",
      });

      if (captcha.current) {
        captcha.current.reset();
      }

      toast({
        title: "Login Successfully",
        description: "Redirecting to dashboard...",
      });

      setIsSuccess(true);

      router.push("/digi-dash");
    } catch (e) {
      if (captcha.current) {
        captcha.current.reset();
        captcha.current.execute();
      }
      if (e instanceof Error) {
        toast({
          title: "Something went wrong",
          description: e.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Something went wrong",
          description: "An unknown error occurred",
          variant: "destructive",
        });
      }
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
      <div className="relative z-50 w-full flex flex-col items-center space-y-2">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center">
          <Image
            src="/assets/icons/digi.webp"
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
            <span className="text-xl font-black text-white">WEALTH</span>
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
        {/* Login Form */}
        <Form {...form}>
          <form
            onSubmit={handleSubmit(handleSignIn)}
            className="w-full space-y-4 max-w-3xs z-50"
          >
            <FormField
              control={control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Username</FormLabel>
                  <FormControl>
                    <Input
                      variant="non-card"
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
                  <FormLabel className="text-white">Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      variant="non-card"
                      placeholder="••••••••"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <div className="w-full flex flex-1 justify-center">
              <Turnstile
                size="flexible"
                sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                onVerify={(token) => {
                  setCaptchaToken(token);
                }}
              />
            </div> */}

            <div className="w-full flex justify-center">
              <Button
                className="rounded-sm font-black p-4"
                disabled={isSubmitting || isSuccess}
                type="submit"
              >
                {isSubmitting || isSuccess ? "Logging in..." : "LOGIN"}
              </Button>
            </div>
          </form>
        </Form>
        <div className="w-full flex justify-center">
          <span className="text-white">or</span>
        </div>
        <LoginDialog />
      </div>
    </>
  );
};

export default LoginPage;
