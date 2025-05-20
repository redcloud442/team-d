"use client";
import { company_member_table } from "@/utils/types";
import TopUpHistoryPageTable from "./TopUpHistoryTable";

type Props = {
  teamMemberProfile: company_member_table;
};

const TopUpHistoryPage = ({ teamMemberProfile }: Props) => {
  return (
    <div className="container mx-auto">
      {/* Header Section */}
      <div>
        <header className="mb-4">
          <h1 className="Title">Top Up History List Page</h1>
          <p className="text-gray-600 dark:text-white">
            View all your transactions that are currently in the system.
          </p>
        </header>

        {/* Table Section */}
        <section>
          <TopUpHistoryPageTable teamMemberProfile={teamMemberProfile} />
        </section>
      </div>
    </div>
  );
};

export default TopUpHistoryPage;
