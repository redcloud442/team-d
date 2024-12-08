import { handleSignInUser } from "@/services/User/Admin";
import { createClientSide } from "@/utils/supabase/client";
import { UserRequestdata } from "@/utils/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import TableLoading from "../ui/tableLoading";

type Props = {
  userProfile: UserRequestdata;
  type?: "ADMIN" | "MEMBER";
};
const PersonalInformation = ({ userProfile, type = "ADMIN" }: Props) => {
  const supabaseClient = createClientSide();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      const response = await handleSignInUser(supabaseClient, {
        userName: userProfile.user_username ?? "",
        password: userProfile.user_password,
        role: "ADMIN",
        iv: userProfile.user_iv ?? "",
      });

      router.push(response);
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Card className="shadow-md">
      {isLoading && <TableLoading />}
      <CardHeader className=" border-b pb-4">
        <div className="flex flex-wrap justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Personal Information
          </CardTitle>
          {type === "ADMIN" && (
            <Button variant="outline" onClick={handleSignIn}>
              Sign In as {userProfile.user_email}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2 p-6">
        <div>
          <Label className="text-sm font-medium text-gray-700">
            First Name
          </Label>
          <Input
            id="firstName"
            type="text"
            value={userProfile.user_first_name || ""}
            readOnly
            className="mt-1 border-gray-300"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">Last Name</Label>
          <Input
            id="lastName"
            type="text"
            value={userProfile.user_last_name || ""}
            readOnly
            className="mt-1 border-gray-300"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">Email</Label>
          <Input
            id="email"
            type="email"
            value={userProfile.user_email || ""}
            readOnly
            className="mt-1 border-gray-300"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">Role</Label>
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
