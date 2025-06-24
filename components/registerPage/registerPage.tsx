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
import { BookOpen, Contact, LockKeyhole, UserIcon } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Resolver, useController, useForm } from "react-hook-form";
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

type Props = {
  referralLink: string;
  userName: string;
};
const RegisterPage = ({ referralLink, userName }: Props) => {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const [hasVerifiedUsername, setHasVerifiedUsername] = useState(false);
  const [cooldown, setCooldown] = useState(false);

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
    formState: { isSubmitting },
    control,
  } = form;

  const router = useRouter();
  const pathName = usePathname();
  const captcha = useRef<BoundTurnstileObject>(null);

  const url = `${BASE_URL}${pathName}`;

  const { field: userNameField } = useController({
    name: "userName",
    control,
  });

  const username = form.watch("userName");

  const {
    isLoading: isUsernameLoading,
    isError,
    isSuccess,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["check-username", username],
    queryFn: () => checkUserName({ userName: username }),
    enabled: false,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 2,
    retry: false,
  });

  const handleClick = async () => {
    if (cooldown) return;
    setCooldown(true);

    await handleFetchUsername();
    setTimeout(() => setCooldown(false), 5000); // 5 sec cooldown
  };

  const handleFetchUsername = async () => {
    const { error } = await refetch();
    if (error) {
      form.setError("userName", {
        message: "Username already taken.",
      });
      setHasVerifiedUsername(false);
    } else {
      form.clearErrors("userName");
      setHasVerifiedUsername(true);
      toast({
        title: "Username Available",
        description: "This username is available!",
      });
    }
  };

  const handleRegistrationSubmit = async (data: RegisterFormData) => {
    if (isUsernameLoading || isError) {
      return toast({
        title: "Please wait",
        description: "Username validation is still in progress.",
        variant: "destructive",
      });
    }

    if (!hasVerifiedUsername) {
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

    //   return;
    // }

    const sanitizedData = escapeFormData(data);

    const { userName, firstName, lastName, botField, referralLink, email } =
      sanitizedData;

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
      });

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

  return (
    <div className="overflow-hidden relative min-h-screen w-full flex items-start sm:items-center justify-center">
      <Form {...form}>
        <form
          className="space-y-4 w-full z-40 py-10 max-w-xs"
          onSubmit={handleSubmit(handleRegistrationSubmit)}
        >
          <div className="flex items-end justify-center pt-4 mb-4 relative">
            <Image
              src="/assets/icons/digi.webp"
              alt="DigiWealth Logo"
              width={100}
              height={100}
              className="w-36 h-auto absolute top-4 left-4 -translate-y-1/2 -translate-x-1/2"
              priority
            />

            <span className="text-2xl font-black text-white">
              REGISTER ACCOUNT
            </span>
          </div>
          <div className="bg-gradient-to-r from-bg-primary to-bg-primary-blue text-white text-center py-4 px-6 rounded-xl mb-4 shadow-lg border border-green-400/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
            <div className="relative z-10 flex items-center justify-center gap-2">
              <span className="font-bold text-xl tracking-wide">₱50 BONUS</span>
            </div>
            <p className="text-sm opacity-90 mt-1 relative z-10">
              Upon Registration
            </p>
          </div>
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
          <FormField
            control={control}
            name="userName"
            render={({ field }) => (
              <FormItem className="relative ">
                <FormControl>
                  <Input
                    id="userName"
                    variant="non-card"
                    icon={
                      <UserIcon
                        className="w-4 h-4"
                        color="white"
                        fill="white"
                      />
                    }
                    className="pl-12 h-16"
                    placeholder="Username"
                    {...field}
                    onChange={(e) => {
                      const val = e.target.value;
                      userNameField.onChange(val);
                    }}
                  />
                </FormControl>

                <Button
                  type="button"
                  onClick={handleClick}
                  disabled={isFetching || cooldown}
                  className="absolute right-0 top-0 bottom-0 h-16 px-4"
                >
                  Verify
                </Button>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    id="firstName"
                    variant="non-card"
                    placeholder="First Name"
                    {...field}
                    className="pl-12 h-16"
                    icon={<Contact className="w-4 h-4" color="white" />}
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
                <FormControl>
                  <Input
                    id="lastName"
                    variant="non-card"
                    placeholder="Last Name"
                    {...field}
                    className="pl-12 h-16"
                    icon={<UserIcon className="w-4 h-4" color="white" />}
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
                <FormControl>
                  <PasswordInput
                    id="password"
                    variant="non-card"
                    placeholder="Password"
                    {...field}
                    icon={
                      <LockKeyhole
                        size={16}
                        className="w-4 h-4"
                        color="white"
                        fill="white"
                      />
                    }
                    className="pl-12 h-16"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />{" "}
          <FormField
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PasswordInput
                    id="confirmPassword"
                    variant="non-card"
                    placeholder="Confirm Password"
                    {...field}
                    className="pl-12 h-16"
                    icon={
                      <LockKeyhole
                        className="w-4 h-4"
                        color="white"
                        fill="white"
                      />
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center gap-4 rounded-md border border-bg-primary-blue h-16 relative text-white bg-bg-primary">
            <div className="flex flex-col items-center justify-center text-white border-r-2 border-bg-primary-blue px-2.5">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span>
                Sponsor -{" "}
                <span className="text-green-400 font-semibold">{userName}</span>
              </span>
              <span className="font-semibold">{referralLink}</span>
            </div>
          </div>
          {/* <div className="w-full flex flex-1 justify-center">
            <Turnstile
              size="flexible"
              sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
              onVerify={(token) => {
                setCaptchaToken(token);
              }}
            />
          </div> */}
          <Button
            className=" font-black rounded-md p-4 shadow-lg border-2 border-black w-full h-16 text-lg"
            disabled={isSubmitting || !isSuccess}
            type="submit"
          >
            Sign up
          </Button>
          <FormField
            control={control}
            name="referralLink"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    id="referralLink"
                    variant="non-card"
                    placeholder="Referral Code"
                    readOnly
                    {...field}
                    className="hidden"
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
                <FormControl>
                  <Input
                    id="sponsor"
                    variant="non-card"
                    placeholder="Sponsor"
                    readOnly
                    {...field}
                    className="hidden"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};

export default RegisterPage;
