import { package_table } from "@prisma/client";
import DashboardDepositModalPackages from "../DashboardPage/DashboardDepositRequest/DashboardDepositModal/DashboardDepositPackagesModal";
type Props = {
  packages: package_table[];
};

const PackagePage = ({ packages }: Props) => {
  return <DashboardDepositModalPackages packages={packages} />;
};

export default PackagePage;
