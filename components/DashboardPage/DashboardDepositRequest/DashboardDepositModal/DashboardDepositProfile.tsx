import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import TableLoading from "@/components/ui/tableLoading";
import { useToast } from "@/hooks/use-toast";
import { logError } from "@/services/Error/ErrorLogs";
import { updateUserProfile } from "@/services/User/User";
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from "@/utils/constant";
import { useRole } from "@/utils/context/roleContext";
import { createClientSide } from "@/utils/supabase/client";
import { User } from "lucide-react";
import { useRef, useState } from "react";

const DashboardDepositProfile = () => {
  const { profile } = useRole();
  const [avatarUrl, setAvatarUrl] = useState(
    profile.user_profile_picture || ""
  );
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const supabaseClient = createClientSide();

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

      const publicUrl =
        "https://cdn.primepinas.com/storage/v1/object/public/USER_PROFILE/" +
        filePath;

      await updateUserProfile({
        userId: profile.user_id,
        profilePicture: publicUrl,
      });

      setAvatarUrl(publicUrl);

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

  if (isUploading) return <TableLoading />;

  return (
    <>
      <Avatar
        onClick={() => inputRef.current?.click()}
        className="rounded-full w-20 h-20"
      >
        <AvatarImage
          src={avatarUrl}
          alt={`${profile.user_first_name} ${profile.user_last_name}`}
        />
        <AvatarFallback className="text-white w-20 h-20 rounded-full mb-4 cursor-pointer">
          <User className="w-14 h-14" />
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
    </>
  );
};

export default DashboardDepositProfile;
