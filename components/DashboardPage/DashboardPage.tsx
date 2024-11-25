"use client";

import { alliance_earnings_table } from "@prisma/client";
import CardAmount from "../ui/cardAmount";

type Props = {
  earnings: alliance_earnings_table;
};

const DashboardPage = ({ earnings }: Props) => {
  return (
    <div className="flex flex-col items-center min-h-screen">
      {/* Buttons Section */}
      <div className="w-full max-w-5xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 ">
          <CardAmount
            title="Wallet"
            value={earnings.alliance_olympus_wallet}
            description=""
            descriptionClassName="text-sm text-red-600"
          />
          <CardAmount
            title="Total Earnings"
            value={earnings.alliance_olympus_earnings}
            description=""
            descriptionClassName="text-sm text-green-600"
          />

          <CardAmount
            title="Total Withdraw"
            value={earnings.alliance_olympus_loot}
            description=""
            descriptionClassName="text-sm text-gray-500"
          />

          <CardAmount
            title="Ally Bounty"
            value={earnings.alliance_ally_bounty}
            description=""
            descriptionClassName="text-sm text-green-600"
          />

          <CardAmount
            title="Legion Bounty"
            value={earnings.alliance_legion_bounty}
            description=""
            descriptionClassName="text-sm text-red-600"
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
