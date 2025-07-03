import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import DashboardDepositModalDeposit from "../DashboardPage/DashboardDepositRequest/DashboardDepositModal/DashboardDepositModalDeposit";
import HistoryTable from "../HistoryPage/HistoryTable";
import { Button } from "../ui/button";

const DepositPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div className="space-x-1">
          <span className="text-2xl font-normal text-white">
            Deposit Request
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
      <DashboardDepositModalDeposit />

      <HistoryTable type="deposit" isBackHidden />
    </div>
  );
};

export default DepositPage;
