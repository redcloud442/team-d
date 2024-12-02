"use client";
import { alliance_member_table } from "@prisma/client";
import LegionBountyTable from "./LegionBountyTable";

type Props = {
  teamMemberProfile: alliance_member_table;
};

const LegionBountyPage = ({ teamMemberProfile }: Props) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div>
        {/* Header Section */}
        <header className="mb-4">
          <h1 className="Title">Legion Bounty Page</h1>
          <p className="text-gray-600">
            View all your legion that are currently in the system.
          </p>
        </header>

        {/* Table Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <LegionBountyTable teamMemberProfile={teamMemberProfile} />
        </section>
      </div>
    </div>
  );
};

export default LegionBountyPage;
