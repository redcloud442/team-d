"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { checkUserName, createTriggerUser } from "@/services/Auth/Auth";
import { BASE_URL } from "@/utils/constant";
import { escapeFormData } from "@/utils/function";
import { RegisterFormData, RegisterSchema } from "@/utils/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { Resolver, useController, useForm } from "react-hook-form";
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

type Props = {
  referralLink: string;
  userName: string;
};
const RegisterPage = ({ referralLink, userName }: Props) => {
  const [isUsernameLoading, setIsUsernameLoading] = useState(false);
  const [isUsernameValidated, setIsUsernameValidated] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { toast } = useToast();
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema) as Resolver<RegisterFormData>,
    defaultValues: {
      referralLink: referralLink,
      sponsor: userName,
      firstName: "",
      lastName: "",
      userName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    setError,
    clearErrors,
  } = form;

  const debounce = <T extends (...args: Parameters<T>) => void>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const router = useRouter();
  const pathName = usePathname();
  const captcha = useRef<BoundTurnstileObject>(null);

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
        form.setError("userName", {
          message: "Username already taken.",
        });
      } finally {
        setIsUsernameLoading(false); // Ensure loading is reset
      }
    }, 3000),
    [form]
  );

  const handleRegistrationSubmit = async (data: RegisterFormData) => {
    if (isUsernameLoading || !isUsernameValidated) {
      return toast({
        title: "Please wait",
        description: "Username validation is still in progress.",
        variant: "destructive",
      });
    }

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

    const sanitizedData = escapeFormData(data);

    const {
      userName,
      firstName,
      lastName,
      botField,
      referralLink,
      email,
      phoneNumber,
    } = sanitizedData;

    try {
      await createTriggerUser({
        userName: userName,
        firstName,
        lastName,
        referalLink: referralLink,
        url,
        captchaToken: captchaToken || "",
        botField: botField || "",
        password: data.password,
        email: email || "",
        phoneNumber: phoneNumber || "",
      });

      if (captcha.current) {
        captcha.current.reset();
      }

      setIsSuccess(true);
      toast({
        title: "Registration Successful",
      });

      localStorage.setItem("isModalOpen", "true");
      router.push("/dashboard");
    } catch (e) {
      setIsSuccess(false);
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
    }
  };

  return (
    <ReusableCard title="Register to XELORA!">
      <Form {...form}>
        <form
          className="space-y-4 w-full max-w-lg mx-auto z-40"
          onSubmit={handleSubmit(handleRegistrationSubmit)}
        >
          <FormField
            control={control}
            name="botField"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormLabel>Bot Field</FormLabel>
                <FormControl>
                  <Input
                    id="botField"
                    placeholder="Bot Field"
                    {...field}
                    hidden
                    className="pr-10"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input
                    id="firstName"
                    placeholder="First Name"
                    {...field}
                    className="pr-10"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input
                    id="lastName"
                    placeholder="Last Name"
                    {...field}
                    className="pr-10"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="userName"
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    id="userName"
                    placeholder="Username"
                    {...field}
                    onChange={(e) => {
                      userNameField.onChange(e.target.value);
                      validateUserName(e.target.value);
                    }}
                    onBlur={() => validateUserName(userNameField.value)}
                    className="pr-10"
                  />
                </FormControl>
                {!isUsernameLoading &&
                  isUsernameValidated &&
                  !errors.userName && (
                    <CheckCircleIcon className="w-5 h-5 text-green-500 absolute right-3 mt-3 top-1/2 -translate-y-1/2" />
                  )}

                {/* Show error icon if validation failed */}
                {!isUsernameLoading && errors.userName && (
                  <XCircleIcon className="w-5 h-5 text-primaryRed absolute right-3 pt-5 top-1/2 -translate-y-1/2" />
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    placeholder="(optional)"
                    {...field}
                    className="pr-10"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input
                    id="phoneNumber"
                    placeholder="(optional)"
                    {...field}
                    className="pr-10"
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
                    id="password"
                    placeholder="Password"
                    {...field}
                    className="pr-10"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="Confirm Password"
                    {...field}
                    className="pr-10"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="sponsor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sponsor</FormLabel>
                <FormControl>
                  <Input
                    id="sponsor"
                    placeholder="Sponsor"
                    {...field}
                    className="pr-10"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* 
            <div className="w-full flex flex-1 justify-center">
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
              Register
            </Button>
          </div>
        </form>
      </Form>
    </ReusableCard>
  );
};

export default RegisterPage;
