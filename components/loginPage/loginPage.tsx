"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { loginValidation } from "@/services/auth/auth";
import { escapeFormData } from "@/utils/function";
import { createClientSide } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import NavigationLoader from "../ui/NavigationLoader";

// Zod Schema for Login Form
const LoginSchema = z.object({
  email: z.string().email("Enter a valid email").min(1, "Email is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof LoginSchema>;

const LoginPage = () => {
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

  const handleSignIn = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      const sanitizedData = escapeFormData(data);

      const { email, password } = sanitizedData;

      const result = await loginValidation(supabase, {
        email,
        password,
      });

      toast({
        title: "Login Successfully",
        variant: "success",
      });

      setIsSuccess(true); // Indicate success
      router.push(result);
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "An unexpected error occurred.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      setIsLoading(false); // Stop loader on error
    }
  };

  return (
    <Card className="w-[400px] mx-auto p-4">
      <NavigationLoader visible={isSubmitting || isLoading || isSuccess} />
      <CardTitle>Login Page</CardTitle>
      <CardContent className="p-4">
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(handleSignIn)}
        >
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="Enter your email"
              {...register("email")}
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
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button
            disabled={isSubmitting || isLoading}
            variant="secondary"
            type="submit"
          >
            {isSubmitting || isLoading ? "Signing in..." : "Sign in"}
          </Button>
          <Button type="button" onClick={() => router.push("/auth/register")}>
            Sign up
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginPage;
