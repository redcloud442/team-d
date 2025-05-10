import { UserRequestdata } from "@/utils/types";
import ChangePasswordUser from "../UserAdminProfile/ChamgePasswordUser";
import ChangePassword from "../UserAdminProfile/ChangePassword";
import PersonalInformation from "../UserAdminProfile/PersonalInformation";
import PersonalInformationUser from "../UserAdminProfile/PersonalInformationUser";

type Props = {
  userProfile: UserRequestdata;
};

const UserProfilePage = ({ userProfile }: Props) => {
  return (
    <div className="mx-auto py-8">
      <div className="w-full flex flex-col gap-6">
        {/* Page Title */}
        <header>
          <h1 className="Title">User Profile</h1>
          <p className="text-gray-600 dark:text-white">
            View your personal information and change your password.
          </p>
        </header>

        {userProfile.company_member_role !== "ADMIN" ? (
          <>
            <PersonalInformationUser userProfile={userProfile} />
            <ChangePasswordUser userProfile={userProfile} />
          </>
        ) : (
          <>
            <PersonalInformation
              type={
                userProfile.company_member_role as
                  | "ADMIN"
                  | "MEMBER"
                  | "ACCOUNTING"
                  | "MERCHANT"
              }
              userProfile={userProfile}
            />
            <ChangePassword userProfile={userProfile} />
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
