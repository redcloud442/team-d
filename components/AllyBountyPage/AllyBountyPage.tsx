"use client";
import { alliance_member_table } from "@prisma/client";
import AllyBountyTable from "./AllyBountyTable";

type Props = {
  teamMemberProfile: alliance_member_table;
};

const AllyBountyPage = ({ teamMemberProfile }: Props) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div>
        {/* Header Section */}
        <header className="mb-4">
          <h1 className="Title">Ally Bounty Page</h1>
          <p className="text-gray-600">
            View all your allies that are currently in the system.
          </p>
        </header>

        {/* Table Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <AllyBountyTable teamMemberProfile={teamMemberProfile} />
        </section>
      </div>
    </div>
  );
};

export default AllyBountyPage;
