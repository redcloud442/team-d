"use client";
import { alliance_member_table } from "@prisma/client";
import AdminWithdrawalHistoryTable from "./AdminWithdrawalTable";

type Props = {
  teamMemberProfile: alliance_member_table;
};

const AdminWithdrawalHistoryPage = ({ teamMemberProfile }: Props) => {
  return (
    <div className="Container">
      <div>
        <header className="mb-4">
          <h1 className="Title">Withdrawal History List Page</h1>
          <p className="text-gray-600">
            View all the withdrawal history that are currently in the system.
          </p>
        </header>

        {/* Table Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <AdminWithdrawalHistoryTable teamMemberProfile={teamMemberProfile} />
        </section>
      </div>
    </div>
  );
};

export default AdminWithdrawalHistoryPage;
