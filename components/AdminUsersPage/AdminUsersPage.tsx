"use client";
import { alliance_member_table } from "@prisma/client";
import AdminUserTable from "./AdminUsersTable";

type Props = {
  teamMemberProfile: alliance_member_table;
};

const AdminUserPage = ({ teamMemberProfile }: Props) => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <header className="text-center mb-8">
        <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl">
          User Table
        </h1>
        <p className="mt-2 text-gray-600">
          View all your top-up transactions, including successful, processing,
          and failed attempts.
        </p>
      </header>

      {/* Table Section */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4">User List</h2>
        <AdminUserTable teamMemberProfile={teamMemberProfile} />
      </section>
    </div>
  );
};

export default AdminUserPage;
