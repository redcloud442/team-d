"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createTriggerUser } from "@/services/auth/auth";
import { logError } from "@/services/Error/ErrorLogs";
import { escapeFormData } from "@/utils/function";
import { createClientSide } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import NavigationLoader from "../ui/NavigationLoader";
import Text from "../ui/text";

const RegisterSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(50, "First name must be less than 50 characters"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(50, "Last name must be less than 50 characters"),
    userName: z
      .string()
      .min(6, "Username must be at least 6 characters long")
      .max(20, "Username must be at most 20 characters long")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
  });
  const supabase = createClientSide();
  const router = useRouter();
  const pathName = usePathname();
  const { toast } = useToast();

  const [isSuccess, setIsSuccess] = useState(false);

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}${pathName}`;

  const handleRegistrationSubmit = async (data: RegisterFormData) => {
    const sanitizedData = escapeFormData(data);

    const { userName, password, firstName, lastName } = sanitizedData;

    try {
      await createTriggerUser(supabase, {
        userName: userName,
        password: password,
        firstName,
        lastName,
        referalLink: referralLink,
        url,
      });
      setIsSuccess(true);
      toast({
        title: "Registration Successful",
        variant: "success",
      });
      router.push("/");
    } catch (e) {
      setIsSuccess(false);
      if (e instanceof Error) {
        await logError(supabase, {
          errorMessage: e.message,
          stackTrace: e.stack,
          stackPath: "components/registerPage/registerPage.tsx",
        });
      }
      const errorMessage =
        e instanceof Error ? e.message : "An unexpected error occurred.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-[400px] mx-auto p-4">
      <NavigationLoader visible={isSubmitting || isSuccess} />
      <CardTitle>Register</CardTitle>
      <CardContent className="p-4">
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(handleRegistrationSubmit)}
        >
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="Enter your first name"
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Enter your last name"
              {...register("lastName")}
            />
            {errors.lastName && (
              <p className="text-sm text-red-500">{errors.lastName.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Username</Label>
            <Input
              id="email"
              placeholder="Enter your username"
              {...register("userName")}
            />
            {errors.userName && (
              <p className="text-sm text-red-500">{errors.userName.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <Button disabled={isSubmitting || isSuccess} type="submit">
            Register
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Text>
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-500">
            Login
          </Link>
        </Text>
      </CardFooter>
    </Card>
  );
};

export default RegisterPage;
