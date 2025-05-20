import { package_table } from "@/utils/types";
import DashboardDepositModalPackages from "../DashboardPage/DashboardDepositRequest/DashboardDepositModal/DashboardDepositPackagesModal";
type Props = {
  packages: (package_table & {
    package_features_table: {
      package_features_description: { text: string; value: string }[];
    }[];
  })[];
};

const PackagePage = ({ packages }: Props) => {
  return (
    <div className="space-y-4">
      <div className="space-x-1">
        <span className="text-2xl font-bold">SELECT</span>
        <span className="text-2xl font-bold text-bg-primary-blue">
          SUBSCRIPTION
        </span>
      </div>
      <DashboardDepositModalPackages packages={packages} />
    </div>
  );
};

export default PackagePage;
