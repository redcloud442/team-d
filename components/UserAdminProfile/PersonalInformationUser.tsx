"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUserSponsor } from "@/services/User/User";
import { useSponsorStore } from "@/store/useSponsortStore";
import { useRole } from "@/utils/context/roleContext";
import { User2 } from "lucide-react";
import { useEffect } from "react";
import DashboardDepositProfile from "../DashboardPage/DashboardDepositRequest/DashboardDepositModal/DashboardDepositProfile";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const PersonalInformationLayout = () => {
  const { profile } = useRole();
  const { sponsor, setSponsor } = useSponsorStore();

  useEffect(() => {
    const fetchUserSponsor = async () => {
      try {
        if (!profile.user_id || sponsor) return;
        const userSponsor = await getUserSponsor({
          userId: profile.user_id,
        });

        setSponsor(userSponsor);
      } catch (e) {}
    };
    fetchUserSponsor();
  }, [profile.user_id, sponsor]);

  return (
    <div className="flex flex-col justify-center items-center gap-4 max-w-sm mx-auto text-xl">
      <Avatar className="w-32 h-32">
        <AvatarImage
          className="w-32 h-32"
          src={profile.user_profile_picture ?? ""}
        />
        <AvatarFallback className="dark:bg-gray-300">
          <User2 className="w-16 h-16" />
        </AvatarFallback>
      </Avatar>
      <DashboardDepositProfile />
      <Label>Sponsor Name</Label>
      <Input
        id="sponsor"
        type="text"
        value={sponsor ?? ""}
        readOnly
        className="text-center"
      />

      <Label>First Name</Label>
      <Input
        id="firstName"
        type="text"
        value={profile.user_first_name || ""}
        readOnly
        className="text-center"
      />

      <Label>Last Name</Label>
      <Input
        id="lastName"
        type="text"
        value={profile.user_last_name || ""}
        readOnly
        className="text-center"
      />

      <Label>Username</Label>
      <Input
        id="userName"
        type="text"
        value={profile.user_username || ""}
        readOnly
        className="text-center"
      />

      <Label>Contact No.</Label>
      <Input
        id="contactNo"
        type="text"
        value={profile.user_phone_number || ""}
        readOnly
        className="text-center"
      />

      <Label>Gender</Label>
      <Input
        id="gender"
        type="text"
        value={profile.user_gender || ""}
        readOnly
        className="text-center"
      />
    </div>
  );
};

export default PersonalInformationLayout;
