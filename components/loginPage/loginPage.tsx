"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { loginValidation } from "@/services/Auth/Auth";
import { escapeFormData } from "@/utils/function";
import { LoginFormValues, LoginSchema } from "@/utils/schema";
import { createClientSide } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
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
import { PasswordInput } from "../ui/passwordInput";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleSignIn = async (data: LoginFormValues) => {
    try {
      // if (!captchaToken) {
      //   if (captcha.current) {
      //     captcha.current.reset();
      //     captcha.current.execute();
      //   }

      //   return toast({
      //     title: "Please wait",
      //     description: "Refreshing CAPTCHA, please try again.",
      //     variant: "destructive",
      //   });
      // }
      setIsLoading(true);
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

      router.push("/dashboard");
    } catch (e) {
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

      setIsLoading(false); // Stop loader on error
    }
  };

  return (
    <ReusableCard title="Welcome to XELORA!">
      <Form {...form}>
        <form
          className="flex flex-col justify-center gap-6 w-full max-w-xs mx-auto"
          onSubmit={handleSubmit(handleSignIn)}
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
                    placeholder="JuanDelaCruz"
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

          {/* <div className="w-full flex items-center justify-center">
            <Turnstile
              size="flexible"
              sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""}
              onVerify={(token) => {
                setCaptchaToken(token);
              }}
            />
          </div> */}

          <div className="w-full flex justify-center">
            <Button
              variant="card"
              className=" font-black text-2xl rounded-full p-5"
              disabled={isSubmitting || isSuccess}
              type="submit"
            >
              {isSubmitting || isSuccess ? "Processing..." : "Login"}
            </Button>
          </div>
        </form>
      </Form>
    </ReusableCard>
  );
};

export default LoginPage;
