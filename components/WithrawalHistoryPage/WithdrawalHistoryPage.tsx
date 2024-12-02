"use client";
import { alliance_member_table } from "@prisma/client";
import WithdrawalHistoryTable from "./WithdrawalHistoryTable";

type Props = {
  teamMemberProfile: alliance_member_table;
};

const WithdrawalHistoryPage = ({ teamMemberProfile }: Props) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div>
        {/* Header Section */}
        <header className="mb-4">
          <h1 className="Title">Withdrawal History List Page</h1>
          <p className="text-gray-600">
            View all your transactions that are currently in the system.
          </p>
        </header>

        {/* Table Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <WithdrawalHistoryTable teamMemberProfile={teamMemberProfile} />
        </section>
      </div>
    </div>
  );
};

export default WithdrawalHistoryPage;
