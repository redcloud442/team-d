import { useToast } from "@/hooks/use-toast";
import { logError } from "@/services/Error/ErrorLogs";
import { getUserSponsor, handleGenerateLink } from "@/services/User/User";
import { userNameToEmail } from "@/utils/function";
import { createClientSide } from "@/utils/supabase/client";
import { UserRequestdata } from "@/utils/types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import TableLoading from "../ui/tableLoading";
import ActiveTreeModal from "./ActiveTreeModal/ActiveTreeModal";

type Props = {
  userProfile: UserRequestdata;
  type?: "ADMIN" | "MEMBER" | "ACCOUNTING" | "MERCHANT";
};

const PersonalInformation = ({ userProfile, type = "ADMIN" }: Props) => {
  const supabaseClient = createClientSide();
  const [isLoading, setIsLoading] = useState(false);
  const [userSponsor, setUserSponsor] = useState<{
    user_username: string;
  } | null>(null);
  const { toast } = useToast();
  const params = useParams();

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      const data = await handleGenerateLink({
        formattedUserName: userNameToEmail(userProfile.user_username ?? ""),
      });

      if (data.url.hashed_token) {
        await navigator.clipboard.writeText(
          `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback?hashed_token=${data.url.hashed_token}`
        );
        setTimeout(() => {
          toast({
            title: "Copied to clipboard",
            description: `You may now access the user's account by accessing the link.`,
          });
        }, 1000);
      } else {
        toast({
          title: "Error",
          description: "Failed to generate link",
          variant: "destructive",
        });
      }

      return data;
    } catch (e) {
      if (e instanceof Error) {
        await logError(supabaseClient, {
          errorMessage: e.message,
          stackTrace: e.stack,
          stackPath: "components/UserAdminProfile/PersonalInformation.tsx",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!userProfile.user_id) return;
    const fetchUserSponsor = async () => {
      try {
        const userId = params.userId;
        const userSponsor = await getUserSponsor({
          userId: userId ? (userId as string) : userProfile.user_id,
        });

        setUserSponsor({ user_username: userSponsor });
      } catch (e) {
        if (e instanceof Error) {
          await logError(supabaseClient, {
            errorMessage: e.message,
            stackTrace: e.stack,
            stackPath: "components/UserAdminProfile/PersonalInformation.tsx",
          });
        }
      }
    };
    fetchUserSponsor();
  }, [userProfile.user_id, params.userId]);

  return (
    <Card className="shadow-md">
      {isLoading && <TableLoading />}
      <CardHeader className=" border-b pb-4">
        <div className="flex flex-wrap justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 ">
            Personal Information
          </CardTitle>
          {type === "ADMIN" && (
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                className="rounded-md w-full"
                onClick={async () => {
                  await handleSignIn();
                }}
              >
                Sign In as {userProfile.user_username}
              </Button>
              <ActiveTreeModal
                teamMemberProfile={userProfile.alliance_member_id}
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2 p-6">
        {userSponsor === null ? (
          <div>
            <Label className="text-sm font-medium ">Sponsor</Label>
            <Input
              id="sponsor"
              type="text"
              value={"Loading..."}
              readOnly
              className="mt-1 border-gray-300"
            />
          </div>
        ) : (
          <div>
            <Label className="text-sm font-medium ">Sponsor</Label>
            <Input
              id="sponsor"
              type="text"
              value={userSponsor.user_username || ""}
              readOnly
              className="mt-1 border-gray-300"
            />
          </div>
        )}
        <div>
          <Label className="text-sm font-medium ">First Name</Label>
          <Input
            id="firstName"
            type="text"
            value={userProfile.user_first_name || ""}
            readOnly
            className="mt-1 border-gray-300"
          />
        </div>
        <div>
          <Label className="text-sm font-medium ">Last Name</Label>
          <Input
            id="lastName"
            type="text"
            value={userProfile.user_last_name || ""}
            readOnly
            className="mt-1 border-gray-300"
          />
        </div>
        <div>
          <Label className="text-sm font-medium ">Username</Label>
          <Input
            id="userName"
            type="text"
            value={userProfile.user_username || ""}
            readOnly
            className="mt-1 border-gray-300"
          />
        </div>
        <div>
          <Label className="text-sm font-medium ">Role</Label>
          <Input
            id="role"
            type="text"
            value={userProfile.alliance_member_role || "N/A"}
            readOnly
            className="mt-1 border-gray-300"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInformation;
