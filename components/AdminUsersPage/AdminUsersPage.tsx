"use client";
import { alliance_member_table } from "@prisma/client";
import AdminUserTable from "./AdminUsersTable";

type Props = {
  teamMemberProfile: alliance_member_table;
};

const AdminUserPage = ({ teamMemberProfile }: Props) => {
  return (
    <div className="container mx-auto p-10">
      <div>
        <header className="mb-4">
          <h1 className="Title">User List Page</h1>
          <p className="text-gray-600">
            View all your user that are currently in the sistem
          </p>
        </header>

        {/* Table Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <AdminUserTable teamMemberProfile={teamMemberProfile} />
        </section>
      </div>
    </div>
  );
};

export default AdminUserPage;
