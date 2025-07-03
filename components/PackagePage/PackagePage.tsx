import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import DashboardDepositModalPackages from "../DashboardPage/DashboardDepositRequest/DashboardDepositModal/DashboardDepositPackagesModal";
import { Button } from "../ui/button";

const PackagePage = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-x-1">
          <span className="text-2xl font-normal text-white">
            Subscription to Earn
          </span>
        </div>

        <div className="flex justify-end items-end">
          <Link href="/digi-dash">
            <Button className="font-black rounded-lg px-4 dark:bg-white text-black">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>
      </div>
      <DashboardDepositModalPackages />
    </div>
  );
};

export default PackagePage;
