import { package_table, PurchaseSummary } from "@/utils/types";
import Link from "next/link";
import DashboardDepositModalPackages from "../DashboardPage/DashboardDepositRequest/DashboardDepositModal/DashboardDepositPackagesModal";
import { Button } from "../ui/button";

type Props = {
  packages: (package_table & {
    package_features_table: {
      package_features_description: { text: string; value: string }[];
    }[];
  })[];
  purchaseSummary: PurchaseSummary;
};

const PackagePage = ({ packages, purchaseSummary }: Props) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between flex-col sm:flex-row flex-wrap gap-2">
        <div className="space-x-1">
          <span className="text-2xl font-bold">SELECT</span>
          <span className="text-2xl font-bold text-bg-primary-blue">
            SUBSCRIPTION
          </span>
        </div>

        <Link href={"/history/earnings"}>
          <Button className="bg-bg-primary-blue text-black text-md font-black px-4 h-6 rounded-md hover:brightness-110 transition w-full">
            Subscription History
          </Button>
        </Link>
      </div>
      <DashboardDepositModalPackages
        packages={packages}
        purchaseSummary={purchaseSummary}
      />
    </div>
  );
};

export default PackagePage;
