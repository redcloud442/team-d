"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUserSponsor } from "@/services/User/User";
import { useEffect, useState } from "react";
import ReusableCard from "../ui/card-reusable";

type PersonalInformationLayoutProps = {
  userProfile: {
    user_first_name: string;
    user_last_name: string;
    user_username: string;
    company_member_role: string;
    direct_referral_count: number;
    indirect_referral_count: number;
    user_id: string;
  };
};

const PersonalInformationLayout = ({
  userProfile,
}: PersonalInformationLayoutProps) => {
  const [userSponsor, setUserSponsor] = useState<{
    user_username: string;
  } | null>(null);

  useEffect(() => {
    const fetchUserSponsor = async () => {
      try {
        const userSponsor = await getUserSponsor({
          userId: userProfile.user_id,
        });

        setUserSponsor({ user_username: userSponsor });
      } catch (e) {
        console.error(e);
      }
    };
    fetchUserSponsor();
  }, [userProfile.user_id]);

  return (
    <ReusableCard title={"Personal Information"}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <Label className="text-sm font-medium">Sponsor</Label>
          <Input
            id="sponsor"
            type="text"
            variant="non-card"
            value={userSponsor?.user_username ?? ""}
            readOnly
            className="mt-1 border-gray-300"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">First Name</Label>
          <Input
            id="firstName"
            type="text"
            variant="non-card"
            value={userProfile.user_first_name || ""}
            readOnly
            className="mt-1 border-gray-300"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Last Name</Label>
          <Input
            id="lastName"
            variant="non-card"
            type="text"
            value={userProfile.user_last_name || ""}
            readOnly
            className="mt-1 border-gray-300"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Username</Label>
          <Input
            id="userName"
            variant="non-card"
            type="text"
            value={userProfile.user_username || ""}
            readOnly
            className="mt-1 border-gray-300"
          />
        </div>
      </div>
    </ReusableCard>
  );
};

export default PersonalInformationLayout;
