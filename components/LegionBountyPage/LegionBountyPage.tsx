"use client";
import { company_member_table } from "@prisma/client";
import LegionBountyTable from "./LegionBountyTable";

type Props = {
  teamMemberProfile: company_member_table;
};

const LegionBountyPage = ({ teamMemberProfile }: Props) => {
  return (
    <div className="md:p-10">
      <div>
        {/* Header Section */}
        <header className="mb-4">
          <h1 className="Title">Indirect Referral Page</h1>
          <p className="text-gray-600 dark:text-white">
            View all your indirect referral that are currently in the system.
          </p>
        </header>

        {/* Table Section */}
        <section className="rounded-lg ">
          <LegionBountyTable teamMemberProfile={teamMemberProfile} />
        </section>
      </div>
    </div>
  );
};

export default LegionBountyPage;
