"use client";

import { Alert } from "@/components/ui/alert"; // ShadCN Alert component
import { Button } from "@/components/ui/button"; // ShadCN Button component
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card"; // ShadCN Card components
import { Input } from "@/components/ui/input"; // ShadCN Input component
import { Label } from "@/components/ui/label"; // ShadCN Label component
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Text from "../ui/text";

type FormData = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignIn = async (data: FormData) => {
    try {
      const { email, password } = data;
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setErrorMessage(error.message);
      } else {
        router.push("/");
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Card className="w-[400px] mx-auto p-4 ">
      <CardTitle>Login Page</CardTitle>
      <CardContent className="p-4">
        {errorMessage && (
          <Alert className="mb-4" variant="destructive">
            {errorMessage}
          </Alert>
        )}
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(handleSignIn)}
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
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          <Button type="button" onClick={() => router.push("/auth/register")}>
            Sign up
          </Button>
          <Button variant="secondary" type="submit">
            Sign in
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Text>
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </CardFooter>
    </Card>
  );
};

export default LoginPage;
