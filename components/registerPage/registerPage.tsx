"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { checkUserName, createTriggerUser } from "@/services/Auth/Auth";
import { BASE_URL } from "@/utils/constant";
import { escapeFormData } from "@/utils/function";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircleIcon, Download, XCircleIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { useController, useForm } from "react-hook-form";
import Turnstile, { BoundTurnstileObject } from "react-turnstile";
import { z } from "zod";
import NavigationLoader from "../ui/NavigationLoader";
import { PasswordInput } from "../ui/passwordInput";

const RegisterSchema = z
  .object({
    firstName: z
      .string()
      .min(3, "First name is required")
      .max(50, "First name must be less than 50 characters"),
    lastName: z
      .string()
      .min(3, "Last name is required")
      .max(50, "Last name must be less than 50 characters"),
    userName: z
      .string()
      .min(6, "Username must be at least 6 characters long")
      .max(20, "Username must be at most 50 characters long")
      .regex(
        /^[a-zA-Z][a-zA-Z0-9._]*$/,
        "Username must start with a letter and can only contain letters, numbers, dots, and underscores"
      ),
    botField: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters"),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirmPassword"],
      });
    }
  });

type RegisterFormData = z.infer<typeof RegisterSchema>;

type Props = {
  referralLink: string;
};
const RegisterPage = ({ referralLink }: Props) => {
  const [isUsernameLoading, setIsUsernameLoading] = useState(false);
  const [isUsernameValidated, setIsUsernameValidated] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, touchedFields },
    control,
    setError,
    clearErrors,
  } = useForm<RegisterFormData>({
    mode: "onBlur",
    resolver: zodResolver(RegisterSchema),
  });
  function debounce<T extends (...args: Parameters<T>) => void>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }
  const lastNameSchema = z.string().min(4).max(50);

  const router = useRouter();
  const pathName = usePathname();
  const captcha = useRef<BoundTurnstileObject>(null);

  const { toast } = useToast();

  const [isSuccess, setIsSuccess] = useState(false);

  const url = `${BASE_URL}${pathName}`;

  const { field: userNameField } = useController({
    name: "userName",
    control,
  });

  const validateUserName = useCallback(
    debounce(async (value: string) => {
      if (!value) return;

      setIsUsernameLoading(true);
      setIsUsernameValidated(false); // Reset validation state while loading

      try {
        const result = await checkUserName({ userName: value });

        if (result.status === 400) {
          setError("userName", { message: "Username already taken." });
        } else if (result.status === 200) {
          clearErrors("userName");
          setIsUsernameValidated(true);
        }
      } catch (e) {
        setError("userName", {
          message: "Username already taken.",
        });
      } finally {
        setIsUsernameLoading(false); // Ensure loading is reset
      }
    }, 3000),
    [clearErrors, setError]
  );

  const handleRegistrationSubmit = async (data: RegisterFormData) => {
    if (isUsernameLoading || !isUsernameValidated) {
      return toast({
        title: "Please wait",
        description: "Username validation is still in progress.",
        variant: "destructive",
      });
    }

    if (!captchaToken) {
      return toast({
        title: "Please wait",
        description: "Captcha is required.",
        variant: "destructive",
      });
    }

    const sanitizedData = escapeFormData(data);

    const { userName, password, firstName, lastName, botField } = sanitizedData;

    try {
      await createTriggerUser({
        userName: userName,
        password: password,
        firstName,
        lastName,
        referalLink: referralLink,
        url,
        captchaToken: captchaToken || "",
        botField: botField || "",
      });

      if (captcha.current) {
        captcha.current.reset();
      }

      setIsSuccess(true);
      toast({
        title: "Registration Successful",
      });

      router.push("/");
    } catch (e) {
      setIsSuccess(false);

      toast({
        title: "Error",
        description: "Check your account details and try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto p-2">
      <NavigationLoader visible={isSubmitting || isSuccess} />
      <CardTitle className="font-bold text-2xl flex items-center justify-between">
        Register
        <a
          href="/Primepinas-App.apk"
          download="Primepinas-App.apk"
          className=" cursor-pointer"
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full h-12 sm:h-10 text-xs sm:text-sm rounded-md bg-stone-700 text-white gap-2 cursor-pointer hover:bg-stone-800 hover:text-white"
          >
            <span className="text-sm">Download Primepinas</span>
            <Download className="w-4 h-4" />
          </Button>
        </a>
      </CardTitle>
      <CardContent className="p-4">
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(handleRegistrationSubmit)}
        >
          <input
            type="text"
            {...register("botField")}
            style={{ display: "none" }} // Hide from normal users
            tabIndex={-1} // Skip focus when tabbing
            autoComplete="off"
          />
          {/* Username Field */}
          <div className="relative">
            <Label htmlFor="userName">Your Username</Label>
            <div className="flex items-center">
              <Input
                id="userName"
                placeholder="Username"
                onChange={(e) => {
                  userNameField.onChange(e.target.value);
                  validateUserName(e.target.value);
                }}
                onBlur={() => validateUserName(userNameField.value)}
                className="pr-10"
              />

              {!isUsernameLoading &&
                isUsernameValidated &&
                !errors.userName && (
                  <CheckCircleIcon className="w-5 h-5 text-green-500 absolute right-3" />
                )}

              {/* Show error icon if validation failed */}
              {!isUsernameLoading && errors.userName && (
                <XCircleIcon className="w-5 h-5 text-primaryRed absolute right-3" />
              )}
            </div>
            {errors.userName && (
              <p className="text-sm text-primaryRed">
                {errors.userName.message}
              </p>
            )}
          </div>

          {/* First Name Field */}
          <div className="relative">
            <Label htmlFor="firstName">First Name</Label>
            <div className="flex items-center">
              <Input
                id="firstName"
                placeholder="First Name"
                {...register("firstName")}
                className="pr-10"
              />
              {touchedFields.firstName && !errors.firstName && (
                <CheckCircleIcon className="w-5 h-5 text-green-500 absolute right-3" />
              )}
            </div>
            {errors.firstName && (
              <p className="text-sm text-primaryRed">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last Name Field */}
          <div className="relative">
            <Label htmlFor="lastName">Last Name</Label>
            <div className="flex items-center">
              <Input
                id="lastName"
                placeholder="Last Name"
                {...register("lastName")}
                className="pr-10"
              />
              {touchedFields.lastName &&
                !errors.lastName &&
                lastNameSchema.safeParse(watch("lastName")).success && (
                  <CheckCircleIcon className="w-5 h-5 text-green-500 absolute right-3" />
                )}
            </div>
            {errors.lastName && (
              <p className="text-sm text-primaryRed">
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="relative">
            <Label htmlFor="password">Password</Label>

            <PasswordInput
              id="password"
              placeholder="Password"
              {...register("password")}
              className="pr-10"
            />
            {touchedFields.password && !errors.password && (
              <CheckCircleIcon className="w-5 h-5 text-green-500 absolute right-10 top-10" />
            )}

            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <Label htmlFor="confirmPassword">Confirm Password</Label>

            <PasswordInput
              id="confirmPassword"
              placeholder="Confirm Password"
              {...register("confirmPassword")}
              className="pr-10"
            />
            {touchedFields.confirmPassword &&
              !errors.confirmPassword &&
              touchedFields.password &&
              !errors.password &&
              watch("password") === watch("confirmPassword") && (
                <CheckCircleIcon className="w-5 h-5 text-green-500 absolute right-10 top-10 " />
              )}
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-primaryRed">
              {errors.confirmPassword.message}
            </p>
          )}

          <div className="relative">
            <Label htmlFor="confirmPassword">Sponsor</Label>
            <div className="flex items-center">
              <Input
                id="sponsor"
                readOnly
                placeholder="Sponsor"
                value={referralLink}
                className="pr-10"
              />
            </div>
          </div>
          {/* <HCaptcha
            ref={captcha}
            sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""}
            onVerify={(token) => {
              setCaptchaToken(token);
            }}
          /> */}
          <div className="w-full flex flex-1 justify-center">
            <Turnstile
              size="flexible"
              sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""}
              onVerify={(token) => {
                setCaptchaToken(token);
              }}
            />
          </div>

          <div className="w-full flex justify-center">
            <Button
              variant="card"
              className="px-4 font-medium"
              disabled={isSubmitting || isSuccess}
              type="submit"
            >
              Submit
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
};

export default RegisterPage;
