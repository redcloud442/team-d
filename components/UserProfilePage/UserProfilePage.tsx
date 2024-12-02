"use client";

import { UserRequestdata } from "@/utils/types";
import ChangePassword from "../UserAdminProfile/ChangePassword";
import PersonalInformation from "../UserAdminProfile/PersonalInformation";

type Props = {
  userProfile: UserRequestdata;
};

const UserProfilePage = ({ userProfile }: Props) => {
  return (
    <div className="Container">
      <div className="w-full flex flex-col gap-6 max-w-6xl">
        {/* Page Title */}
        <header>
          <h1 className="Title">User Profile</h1>
          <p className="text-gray-600">
            View all the withdrawal history that are currently in the system.
          </p>
        </header>

        <PersonalInformation type="MEMBER" userProfile={userProfile} />

        <ChangePassword userProfile={userProfile} />
      </div>
    </div>
  );
};

export default UserProfilePage;
