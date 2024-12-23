"use client";
import { alliance_member_table } from "@prisma/client";

import MerchantTable from "./MerchantTable";

type Props = {
  teamMemberProfile: alliance_member_table;
};

const MerchantPage = ({ teamMemberProfile }: Props) => {
  return (
    <div className="mx-auto py-8 md:p-10">
      <div>
        <header className="mb-4">
          <h1 className="Title">Merchant Page</h1>
          <p className="text-gray-600 dark:text-white">
            View all the merchant that are currently in the system.
          </p>
        </header>

        {/* Table Section */}
        <section className=" rounded-lg">
          <MerchantTable teamMemberProfile={teamMemberProfile} />
        </section>
      </div>
    </div>
  );
};

export default MerchantPage;
