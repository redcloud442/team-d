"use client";

import { UserRequestdata } from "@/utils/types";
import TopUpHistoryTable from "../TopUpHistoryPage/TopUpHistoryTable";
import WithdrawalHistoryTable from "../WithrawalHistoryPage/WithdrawalHistoryTable";
import ChangePassword from "./ChangePassword";
import PersonalInformation from "./PersonalInformation";

type Props = {
  userProfile: UserRequestdata;
};

const UserAdminProfile = ({ userProfile }: Props) => {
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

        <PersonalInformation userProfile={userProfile} />

        <ChangePassword userProfile={userProfile} />

        <TopUpHistoryTable teamMemberProfile={userProfile} />

        <WithdrawalHistoryTable teamMemberProfile={userProfile} />
      </div>
    </div>
  );
};

export default UserAdminProfile;
