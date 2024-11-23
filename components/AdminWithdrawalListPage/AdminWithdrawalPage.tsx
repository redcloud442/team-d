"use client";
import { alliance_member_table } from "@prisma/client";
import AdminWithdrawalHistoryTable from "./AdminWithdrawalTable";

type Props = {
  teamMemberProfile: alliance_member_table;
};

const AdminWithdrawalHistoryPage = ({ teamMemberProfile }: Props) => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <header className="text-center mb-8">
        <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl">
          Withdrawal History
        </h1>
        <p className="mt-2 text-gray-600">
          View all your withdrawal transactions, including successful,
          processing, and failed attempts.
        </p>
      </header>

      {/* Table Section */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4">
          Transaction List
        </h2>
        <AdminWithdrawalHistoryTable teamMemberProfile={teamMemberProfile} />
      </section>
    </div>
  );
};

export default AdminWithdrawalHistoryPage;
