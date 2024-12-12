"use client";

import { alliance_member_table } from "@prisma/client";
import WithdrawalTable from "./WithdrawalTable";

type Props = {
  teamMemberProfile: alliance_member_table;
};

const WithdrawalPage = ({ teamMemberProfile }: Props) => {
  return (
    <div className="mx-auto md:p-10">
      <div>
        <header className="mb-4">
          <h1 className="Title">Withdrawal History List Page</h1>
          <p className="text-gray-600 dark:text-white">
            View all the withdrawal history that are currently in the system.
          </p>
        </header>

        {/* Table Section */}
        <section className=" rounded-lg p-6">
          <WithdrawalTable teamMemberProfile={teamMemberProfile} />
        </section>
      </div>
    </div>
  );
};

export default WithdrawalPage;
