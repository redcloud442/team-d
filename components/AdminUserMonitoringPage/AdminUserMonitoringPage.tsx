"use client";
import { alliance_member_table } from "@prisma/client";
import AdminUserMonitoringTable from "./AdminUserMonitoringTable";

type Props = {
  teamMemberProfile: alliance_member_table;
};

const AdminUserMonitoringPage = ({ teamMemberProfile }: Props) => {
  return (
    <div className="mx-auto md:p-10 space-y-6">
      <div>
        {/* Page Title */}
        <header className="mb-4">
          <h1 className="Title">Users With Wallet Balance Page</h1>
          <p className="text-gray-600 dark:text-white">
            View all your user with wallet balance that are currently in the
            system
          </p>
        </header>

        {/* Table Section */}
        <section className=" rounded-lg ">
          <AdminUserMonitoringTable teamMemberProfile={teamMemberProfile} />
        </section>
      </div>
    </div>
  );
};

export default AdminUserMonitoringPage;
