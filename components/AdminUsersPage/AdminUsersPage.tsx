"use client";
import { alliance_member_table } from "@prisma/client";
import AdminUserTable from "./AdminUsersTable";

type Props = {
  teamMemberProfile: alliance_member_table;
};

const AdminUserPage = ({ teamMemberProfile }: Props) => {
  return (
    <div className="mx-auto">
      <div className="w-full flex flex-col gap-6 max-w-6xl">
        {/* Page Title */}
        <header className="mb-4">
          <h1 className="Title">User List Page</h1>
          <p className="text-gray-600 dark:text-white">
            View all your user that are currently in the system
          </p>
        </header>

        {/* Table Section */}
        <section className=" rounded-lg ">
          <AdminUserTable teamMemberProfile={teamMemberProfile} />
        </section>
      </div>
    </div>
  );
};

export default AdminUserPage;
