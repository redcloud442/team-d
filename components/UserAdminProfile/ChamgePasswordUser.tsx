"use client";
import { useToast } from "@/hooks/use-toast";
import { logError } from "@/services/Error/ErrorLogs";
import { changeUserPassword } from "@/services/User/User";
import { createClientSide } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { PasswordInput } from "../ui/passwordInput";

import { useRole } from "@/utils/context/roleContext";
import { ChangePasswordFormValues, ChangePasswordSchema } from "@/utils/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
const ChangePasswordUser = () => {
  const { toast } = useToast();
  const { profile } = useRole();
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = form;

  const supabaseClient = createClientSide();

  const onSubmit = async (data: ChangePasswordFormValues) => {
    try {
      await changeUserPassword({
        userId: profile.user_id,
        email: profile.user_email ?? "",
        password: data.password,
      });

      reset();

      toast({
        title: "Password Change Successfully",
      });
    } catch (e) {
      if (e instanceof Error) {
        await logError(supabaseClient, {
          errorMessage: e.message,
          stackTrace: e.stack,
          stackPath: "components/UserAdminProfile/ChangePassword.tsx",
        });
      }
      toast({
        title: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <div className=" container mx-auto flex flex-col items-center justify-center">
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 text-2xl pt-4"
        >
          <FormField
            control={control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    id="password"
                    className="text-center"
                    {...field}
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
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    id="confirmPassword"
                    className="text-center"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <div className="flex items-center justify-center">
            <Button
              disabled={isSubmitting}
              type="submit"
              className=" font-black text-2xl rounded-xl p-5"
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              Save
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ChangePasswordUser;
