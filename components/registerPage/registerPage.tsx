"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTriggerUser } from "@/services/auth/auth";
import { hashData, sanitizeData } from "@/utils/function";
import { createClientSide } from "@/utils/supabase/client";
import { RegisterFormData } from "@/utils/types";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Text from "../ui/text";

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();
  const supabase = createClientSide();
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsloading] = useState(false);

  const referalLink = searchParams.get("referalLink") as string;
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}${pathName}`;

  const handleRegistrationSubmit = async (data: RegisterFormData) => {
    const sanitizedData = sanitizeData(data);
    const { email, password, confirmPassword } = sanitizedData;

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    try {
      setIsloading(true);
      const hashedPassword = await hashData(password);
      await createTriggerUser(supabase, {
        email: email,
        password: hashedPassword,
        referalLink,
        url,
      });

      setSuccessMessage("Registration successful!");
      setErrorMessage(null);
      router.push("/");
    } catch (e) {
      console.log(e);

      setErrorMessage("An error occurred during registration.");
    } finally {
      setIsloading(false);
    }
  };

  return (
    <Card className="w-[400px] mx-auto p-4 ">
      <CardTitle>Register</CardTitle>
      <CardContent className="p-4">
        {errorMessage && <Alert variant="destructive">{errorMessage}</Alert>}
        {successMessage && <Alert>{successMessage}</Alert>}
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(handleRegistrationSubmit)}
        >
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="Enter your email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email",
                },
              })}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters long",
                },
              })}
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
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === watch("password") || "Passwords do not match",
              })}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <Button disabled={isLoading} type="submit">
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
