"use client";
import { alliance_member_table } from "@prisma/client";
import AllyBountyTable from "./AllyBountyTable";

type Props = {
  teamMemberProfile: alliance_member_table;
  sponsor: string;
};

const AllyBountyPage = ({ teamMemberProfile, sponsor }: Props) => {
  return (
    <div className="md:p-10">
      <div>
        {/* Header Section */}
        <header className="mb-4">
          <h1 className="Title">Direct Referral Page</h1>
          <p className="text-gray-600 dark:text-white">
            View all your direct referral that are currently in the system.
          </p>
        </header>

        <section className=" rounded-lg  p-6">
          <AllyBountyTable
            teamMemberProfile={teamMemberProfile}
            sponsor={sponsor}
          />
        </section>
      </div>
    </div>
  );
};

export default AllyBountyPage;
