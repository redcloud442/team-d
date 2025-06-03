"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { checkUserName, createTriggerUser } from "@/services/Auth/Auth";
import { BASE_URL } from "@/utils/constant";
import { escapeFormData } from "@/utils/function";
import { RegisterFormData, RegisterSchema } from "@/utils/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Resolver, useController, useForm } from "react-hook-form";
import Turnstile, { BoundTurnstileObject } from "react-turnstile";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { PasswordInput } from "../ui/passwordInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";

type Props = {
  referralLink: string;
  userName: string;
};
const RegisterPage = ({ referralLink, userName }: Props) => {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [username, setUsername] = useState("");

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
      phoneNumber: "",
    },
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
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

  const debounceSetUsername = useMemo(() => {
    return debounce((val: string) => {
      setUsername(val);
    }, 1000); // 300ms delay
  }, []);

  const {
    data: usernameStatus,
    isLoading: isUsernameLoading,
    isError,
  } = useQuery({
    queryKey: ["check-username", username],
    queryFn: () => checkUserName({ userName: username }),
    enabled: !!username,
    staleTime: 1000 * 60 * 2,
    retry: false,
  });

  useEffect(() => {
    if (isError) {
      form.setError("userName", {
        message: "Username already taken.",
      });
    } else {
      form.clearErrors("userName");
    }
  }, [isError, form]);

  const handleRegistrationSubmit = async (data: RegisterFormData) => {
    if (isUsernameLoading || isError) {
      return toast({
        title: "Please wait",
        description: "Username validation is still in progress.",
        variant: "destructive",
      });
    }

    if (!captchaToken) {
      if (captcha.current) {
        captcha.current.reset();
        captcha.current.execute();
      }

      return;
    }

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
        gender: data.gender || "",
      });

      if (captcha.current) {
        captcha.current.reset();
      }

      toast({
        title: "DIGIWEALTH Account Created",
        description: "Please wait while we redirect you to your dashboard.",
      });

      router.push("/digi-dash");
    } catch (e) {
      if (captcha.current) {
        captcha.current.reset();
      }
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

  const passwordValue = form.watch("password");
  const confirmPasswordValue = form.watch("confirmPassword");

  const passwordsMatch =
    passwordValue !== "" &&
    confirmPasswordValue !== "" &&
    passwordValue === confirmPasswordValue;

  return (
    <div className="overflow-hidden relative min-h-screen w-full flex items-center justify-center">
      <Image
        src="/assets/bg/loginBg.webp"
        alt="Digi Wealth Logo"
        width={420}
        height={420}
        priority
        className="absolute -bottom-1/5 left-0 object-cover z-30 rotate-90"
      />

      <Image
        src="/assets/bg/RegisterBgTop.webp"
        alt="Digi Wealth Logo"
        width={420}
        height={420}
        priority
        className="absolute -top-2 right-0 object-cover z-30"
      />

      <Form {...form}>
        <form
          className="space-y-1 w-full z-40 py-10"
          onSubmit={handleSubmit(handleRegistrationSubmit)}
        >
          <div className="flex items-center justify-start">
            <Image
              src="/assets/icons/IconGif.webp"
              alt="DigiWealth Logo"
              width={100}
              height={100}
              className="w-24 h-auto"
              priority
            />

            {/* Title */}
            <div className="flex flex-col items-start justify-center">
              <div className="flex items-center justify-center">
                <span className="text-md font-black text-bg-primary-blue">
                  DIGI
                </span>
                <span className="text-md font-black text-white">WEALTH</span>
              </div>
              <div className="flex items-center justify-center text-white space-x-1">
                <span className="text-2xl font-black">CREATE ACCOUNT</span>
              </div>
            </div>
          </div>

          <h1 className="text-md text-white font-black px-4 pt-2">
            Account Information
          </h1>
          <Separator className="mb-4" />

          <div className="w-full flex justify-center">
            <div className="flex flex-col gap-2 max-w-lg">
              <FormField
                control={control}
                name="botField"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormLabel>Bot Field</FormLabel>
                    <FormControl>
                      <Input
                        id="botField"
                        variant="non-card"
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
              <div className="relative">
                <FormField
                  control={control}
                  name="userName"
                  render={({ field }) => (
                    <FormItem className="relative ">
                      <FormLabel className="text-start">Username</FormLabel>
                      <FormControl>
                        <Input
                          id="userName"
                          variant="non-card"
                          placeholder="Username"
                          {...field}
                          onChange={(e) => {
                            const val = e.target.value;
                            userNameField.onChange(val); // update form field

                            debounceSetUsername(val); // triggers query after delay
                          }}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div
                  className={`w-7 h-7 absolute -right-10 mt-3 top-1/2 -translate-y-1/2  border-2 rounded-full z-50 ${
                    !isUsernameLoading && usernameStatus && !isError
                      ? " bg-bg-primary-blue "
                      : "bg-transparent"
                  }`}
                ></div>
              </div>

              <div className="relative">
                <FormField
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-start">Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          id="password"
                          variant="non-card"
                          placeholder="Password"
                          {...field}
                          className=""
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />{" "}
                <div
                  className={`w-7 h-7 absolute -right-10 mt-3 top-1/2 -translate-y-1/2  border-2 rounded-full z-50 ${
                    passwordsMatch ? " bg-bg-primary-blue " : "bg-transparent"
                  }`}
                ></div>
              </div>

              <div className="relative">
                <FormField
                  control={control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-start">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          id="confirmPassword"
                          variant="non-card"
                          placeholder="Confirm Password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div
                  className={`w-7 h-7 absolute -right-10 mt-3 top-1/2 -translate-y-1/2  border-2 rounded-full z-50 ${
                    passwordsMatch ? " bg-bg-primary-blue " : "bg-transparent"
                  }`}
                ></div>
              </div>
            </div>
          </div>

          <h1 className="text-md text-white font-black px-4 pt-2">
            Membership Information
          </h1>
          <Separator className="mb-4" />

          <div className="grid grid-cols-2 gap-2 items-center justify-center px-4 gap-x-4">
            <FormField
              control={control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input
                      id="firstName"
                      variant="non-card"
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
                      variant="non-card"
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
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      id="phoneNumber"
                      variant="non-card"
                      placeholder="Phone Number"
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
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue
                          className="text-center"
                          placeholder="Gender"
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <h1 className="text-md text-white font-black px-4 pt-2">
            Your Sponsor Information
          </h1>
          <Separator className="mb-4" />

          <div className="flex items-center justify-center gap-4 px-4">
            <FormField
              control={control}
              name="referralLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referral Code</FormLabel>
                  <FormControl>
                    <Input
                      id="referralLink"
                      variant="non-card"
                      placeholder="Referral Code"
                      readOnly
                      {...field}
                      className="p-0"
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
                      variant="non-card"
                      placeholder="Sponsor"
                      readOnly
                      {...field}
                      className="p-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full flex flex-1 justify-center">
            <Turnstile
              size="flexible"
              sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
              onVerify={(token) => {
                setCaptchaToken(token);
              }}
            />
          </div>

          <div className="w-full flex justify-center mt-4">
            <Button
              className=" font-black rounded-md p-4 shadow-lg border-2 border-black"
              disabled={isSubmitting || !isError}
              type="submit"
            >
              REGISTER
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default RegisterPage;
