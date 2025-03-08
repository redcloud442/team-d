"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { loginValidation } from "@/services/Auth/Auth";
import { escapeFormData } from "@/utils/function";
import { createClientSide } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";

import { Download } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Turnstile, { BoundTurnstileObject } from "react-turnstile";
import { z } from "zod";
import NavigationLoader from "../ui/NavigationLoader";
import { PasswordInput } from "../ui/passwordInput";

export const LoginSchema = z.object({
  userName: z
    .string()
    .min(6, "Username must be at least 6 characters long")
    .max(50, "Username must be at most 50 characters long")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9._]*$/, // ✅ Allows letters OR numbers at the start
      "Username must start with a letter or number and can only contain letters, numbers, dots, and underscores"
    ),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof LoginSchema>;

const LoginPage = () => {
  const captcha = useRef<BoundTurnstileObject>(null);

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
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleSignIn = async (data: LoginFormValues) => {
    try {
      if (!captchaToken) {
        if (captcha.current) {
          captcha.current.reset();
          captcha.current.execute();
        }

        return toast({
          title: "Please wait",
          description: "Refreshing CAPTCHA, please try again.",
          variant: "destructive",
        });
      }
      setIsLoading(true);
      const sanitizedData = escapeFormData(data);

      const { userName, password } = sanitizedData;

      await loginValidation(supabase, {
        userName,
        password,
        captchaToken,
      });

      if (captcha.current) {
        captcha.current.reset();
      }

      toast({
        title: "Login Successfully",
        description: "Redirecting to dashboard...",
      });

      setIsSuccess(true);
      localStorage.setItem("isModalOpen", "true");
      router.push("/dashboard");
    } catch (e) {
      if (e instanceof Error) {
        toast({
          title: "Error",
          description: e.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An unknown error occurred",
          variant: "destructive",
        });
      }

      setIsLoading(false); // Stop loader on error
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center sm:justify-center min-h-screen h-full p-10">
      <NavigationLoader visible={isSubmitting || isLoading || isSuccess} />

      <div className="fixed top-0 sm:top-20 -right-6  z-10 ">
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
          priority
        />
      </div>

      <div className="absolute top-[10%] sm:top-[10%] flex items-center justify-center w-full">
        <Image
          src="/app-logo.svg"
          alt="logo"
          width={120}
          height={120}
          priority
        />
      </div>
      <form
        className="flex flex-col items-center justify-center gap-6 w-full max-w-lg m-4 z-40"
        onSubmit={handleSubmit(handleSignIn)}
      >
        <a
          href="https://apkfilelinkcreator.cloud/uploads/PrimePinas_v1.1.apk"
          download="PrimePinas_v1.1.apk"
          className="w-full cursor-pointer"
        >
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 rounded-md bg-background text-white gap-2 cursor-pointer hover:bg-stone-800 hover:text-white"
          >
            <Image
              src="/app-logo.svg"
              alt="logo"
              width={35}
              height={35}
              priority
            />
            <span className="text-sm">Download Pr1me App</span>
            <Download className="w-4 h-4" />
          </Button>
        </a>

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
          <PasswordInput
            variant="non-card"
            id="password"
            placeholder="Password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="w-full flex items-center justify-center">
          <Turnstile
            size="flexible"
            sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""}
            onVerify={(token) => {
              setCaptchaToken(token);
            }}
          />
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
