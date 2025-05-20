import PersonalInformationUser from "../UserAdminProfile/PersonalInformationUser";

const UserProfilePageUser = () => {
  return (
    <div className="mx-auto py-8">
      <div className="w-full flex flex-col gap-6 sm:p-10">
        {/* Page Title */}
        <header>
          <div className="space-x-1">
            <span className="text-2xl font-bold">YOUR</span>
            <span className="text-2xl font-bold text-bg-primary-blue">
              PROFILE
            </span>
          </div>
        </header>

        <PersonalInformationUser />
      </div>
    </div>
  );
};

export default UserProfilePageUser;
