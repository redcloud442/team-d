"use client";
import { useToast } from "@/hooks/use-toast";
import { logError } from "@/services/Error/ErrorLogs";
import { changeUserPassword } from "@/services/User/User";
import { createClientSide } from "@/utils/supabase/client";
import { UserRequestdata } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { PasswordInput } from "../ui/passwordInput";

import { ChangePasswordFormValues, ChangePasswordSchema } from "@/utils/schema";
import ReusableCard from "../ui/card-reusable";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

type Props = {
  userProfile: UserRequestdata;
  setUserProfile?: Dispatch<SetStateAction<UserRequestdata>>;
};

const ChangePasswordUser = ({ userProfile, setUserProfile }: Props) => {
  const { toast } = useToast();
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
        userId: userProfile.user_id,
        email: userProfile.user_email ?? "",
        password: data.password,
      });

      reset();
      if (setUserProfile) {
        setUserProfile((prev: UserRequestdata) => ({
          ...prev,
        }));
      }
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
    <ReusableCard title="Change Password">
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 pt-4 gap-4"
        >
          <FormField
            control={control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  New Password
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    id="password"
                    variant="non-card"
                    className="mt-1 border-gray-300"
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
                <FormLabel className="text-sm font-medium">
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    id="confirmPassword"
                    variant="non-card"
                    className="mt-1 border-gray-300"
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
              variant="card"
              className=" font-black text-2xl rounded-full p-5"
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </ReusableCard>
  );
};

export default ChangePasswordUser;
