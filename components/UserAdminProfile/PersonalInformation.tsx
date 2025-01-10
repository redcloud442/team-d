import { useToast } from "@/hooks/use-toast";
import { logError } from "@/services/Error/ErrorLogs";
import { handleSignInUser } from "@/services/User/Admin";
import { getUserSponsor } from "@/services/User/User";
import { useRole } from "@/utils/context/roleContext";
import { createClientSide } from "@/utils/supabase/client";
import { UserRequestdata } from "@/utils/types";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import TableLoading from "../ui/tableLoading";

type Props = {
  userProfile: UserRequestdata;
  type?: "ADMIN" | "MEMBER" | "ACCOUNTING" | "MERCHANT";
};
const PersonalInformation = ({ userProfile, type = "ADMIN" }: Props) => {
  const supabaseClient = createClientSide();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userSponsor, setUserSponsor] = useState<{
    user_username: string;
  } | null>(null);
  const { setRole } = useRole();
  const { toast } = useToast();
  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await handleSignInUser(supabaseClient, {
        userName: userProfile.user_username ?? "",
        password: userProfile.user_password,
        role: type,
        iv: userProfile.user_iv ?? "",
        userProfile: userProfile,
      });
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
        const userSponsor = await getUserSponsor({
          userId: userProfile.user_id,
        });

        setUserSponsor(userSponsor);
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
  }, [userProfile.user_id]);

  return (
    <Card className="shadow-md">
      {isLoading && <TableLoading />}
      <CardHeader className=" border-b pb-4">
        <div className="flex flex-wrap justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 ">
            Personal Information
            {userSponsor === null ? (
              <Loader2 className="animate-spin" />
            ) : (
              <span className="text-md">
                ( Sponsored by: {userSponsor.user_username} )
              </span>
            )}
          </CardTitle>
          {type === "ADMIN" && (
            <Button
              variant="outline"
              onClick={async () => {
                await handleSignIn();
                if (userProfile.alliance_member_restricted) {
                  return toast({
                    title: "User is banned.",
                    description: "Cannot sign in as banned user.",
                    variant: "destructive",
                  });
                }
                setRole({
                  role: userProfile.alliance_member_role,
                  userName: userProfile.user_username ?? "",
                });
                await router.push("/");
              }}
            >
              Sign In as {userProfile.user_username}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2 p-6">
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
