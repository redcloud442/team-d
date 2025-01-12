import { changeUserPassword } from "@/app/actions/auth/authAction";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import TableLoading from "@/components/ui/tableLoading";
import { useToast } from "@/hooks/use-toast";
import { logError } from "@/services/Error/ErrorLogs";
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from "@/utils/constant";
import { escapeFormData, userNameToEmail } from "@/utils/function";
import { createClientSide } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { alliance_member_table, user_table } from "@prisma/client";
import { CheckCircleIcon, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
  teamMemberProfile: alliance_member_table;
  profile: user_table;
};

const ChangePasswordSchema = z
  .object({
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

type ChangePasswordFormValues = z.infer<typeof ChangePasswordSchema>;

const DashboardDepositProfile = ({ profile }: Props) => {
  const [open, setOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(
    profile.user_profile_picture || ""
  );
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  const supabaseClient = createClientSide();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormValues) => {
    try {
      const formData = escapeFormData(data);

      await changeUserPassword({
        userId: profile.user_id,
        email: userNameToEmail(profile?.user_username || ""),
        password: formData.password,
      });

      reset();
      toast({
        title: "Password Change Successfully",
        variant: "success",
      });
      setOpen(false);
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

  const handleUploadProfilePicture = async (file: File) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast({
        title: "Error",
        description: `File size exceeds the ${MAX_FILE_SIZE_MB} MB limit.`,
        variant: "destructive",
      });
      return;
    }
    const filePath = `profile-pictures/${Date.now()}_${file.name}`;
    try {
      setIsUploading(true);
      const { error: uploadError } = await supabaseClient.storage
        .from("USER_PROFILE")
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`File upload failed: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabaseClient.storage
        .from("USER_PROFILE")
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error(
          "Failed to retrieve the public URL of the uploaded file."
        );
      }

      // Update user profile with new avatar URL
      const { error: updateError } = await supabaseClient
        .schema("user_schema")
        .from("user_table")
        .update({ user_profile_picture: publicUrlData.publicUrl })
        .eq("user_id", profile.user_id);

      if (updateError) {
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }

      setAvatarUrl(publicUrlData.publicUrl);

      toast({
        title: "Profile Picture Updated Successfully",
      });
    } catch (error) {
      await supabaseClient.storage.from("USER_PROFILE").remove([filePath]);
      if (error instanceof Error) {
        await logError(supabaseClient, {
          errorMessage: error.message,
          stackTrace: error.stack,
          stackPath:
            "components/DashboardPage/DashboardDepositRequest/DashboardDepositModal/DashboardDepositProfile.tsx",
        });
      }
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
      }}
    >
      <DialogTrigger asChild>
        <Avatar className="cursor-pointer">
          {isUploading ? (
            <TableLoading />
          ) : (
            <>
              <AvatarImage
                src={avatarUrl}
                alt={`${profile.user_first_name} ${profile.user_last_name}`}
              />
              <AvatarFallback>
                {profile.user_first_name?.slice(0, 1).toUpperCase()}
                {profile.user_last_name?.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </>
          )}
        </Avatar>
      </DialogTrigger>

      <DialogContent>
        <ScrollArea className="h-[500px] sm:h-full">
          <DialogTitle className="text-2xl font-bold mb-4">
            Personal Profile
          </DialogTitle>
          <DialogDescription />

          <div className="relative flex flex-col gap-4">
            {/* Header */}

            {/* Profile Picture */}
            <div className="flex justify-between gap-4">
              <Avatar
                onClick={() => inputRef.current?.click()}
                className="w-40 h-auto rounded-xl mb-4"
              >
                <AvatarImage
                  src={avatarUrl}
                  alt={`${profile.user_first_name} ${profile.user_last_name}`}
                />
                <AvatarFallback
                  onClick={() => setOpen(true)}
                  className="text-white w-40 h-auto rounded-xl mb-4 cursor-pointer"
                >
                  {profile.user_first_name?.slice(0, 1).toUpperCase()}
                  {profile.user_last_name?.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <Input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    await handleUploadProfilePicture(file);
                  }
                }}
              />

              <div className="flex flex-col gap-4">
                <div>
                  <Label>Your Username</Label>
                  <Input
                    readOnly
                    value={profile?.user_username || "gagamboy123"}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label>Your Username</Label>
                  <Input
                    readOnly
                    value={profile?.user_username || "gagamboy123"}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div>
                <Label>First Name</Label>
                <Input
                  readOnly
                  value={profile?.user_first_name || ""}
                  className="w-full"
                />
              </div>

              <div>
                <Label>Last Name</Label>
                <Input
                  readOnly
                  value={profile?.user_last_name || ""}
                  className="w-full"
                />
              </div>
            </div>
            {/* Change Password */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              {/* Password */}

              <div className="relative">
                <Label htmlFor="password">Password</Label>
                <div className="flex items-center">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    {...register("password")}
                    className="pr-10"
                  />
                  {touchedFields.password && !errors.password && (
                    <CheckCircleIcon className="w-5 h-5 text-green-500 absolute right-3" />
                  )}
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
              {/* Confirm Password */}
              <div className="relative">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="flex items-center">
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm Password"
                    {...register("confirmPassword")}
                    className="pr-10"
                  />
                  {touchedFields.confirmPassword &&
                    !errors.confirmPassword &&
                    touchedFields.password &&
                    !errors.password &&
                    watch("password") === watch("confirmPassword") && (
                      <CheckCircleIcon className="w-5 h-5 text-green-500 absolute right-3" />
                    )}
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <Button
                  disabled={isSubmitting}
                  type="submit"
                  className="h-12"
                  variant="card"
                >
                  {isSubmitting && <Loader2 className="animate-spin" />}
                  Submit
                </Button>
              </div>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardDepositProfile;
