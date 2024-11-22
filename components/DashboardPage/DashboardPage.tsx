"use client";

import { alliance_earnings_table } from "@prisma/client";
import CardAmount from "../ui/cardAmount";
type Props = {
  earnings: alliance_earnings_table;
};
const DashboardPage = ({ earnings }: Props) => {
  const totalEarnings =
    earnings.alliance_ally_bounty +
    earnings.alliance_legion_bounty +
    earnings.alliance_olympus_earnings;

  return (
    <div className="flex flex-col items-center min-h-screen">
      {/* Buttons Section */}
      <div className="w-full max-w-5xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 ">
          <CardAmount
            title="Earnings"
            value={earnings.alliance_olympus_earnings}
            description="+20.1% from last month"
            descriptionClassName="text-sm text-green-600"
          />

          <CardAmount
            title="Total Earnings"
            value={totalEarnings}
            description="Updated 5 minutes ago"
            descriptionClassName="text-sm text-gray-500"
          />

          <CardAmount
            title="Ally Bounty"
            value={earnings.alliance_ally_bounty}
            description="+15.6% from last week"
            descriptionClassName="text-sm text-green-600"
          />

          <CardAmount
            title="Legion Bounty"
            value={earnings.alliance_legion_bounty}
            description="-10.2% from last month"
            descriptionClassName="text-sm text-red-600"
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
