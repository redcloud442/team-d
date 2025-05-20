"use client";

import PackageCard from "@/components/ui/packageCard";
import { package_table } from "@/utils/types";
import { useRouter } from "next/navigation";

type Props = {
  packages: (package_table & {
    package_features_table: {
      package_features_description: { text: string; value: string }[];
    }[];
  })[];
};

const DashboardDepositModalPackages = ({ packages }: Props) => {
  const router = useRouter();

  const generateRandomNumberAndLetter = () => {
    return Math.floor(Math.random() * 10000000000000000);
  };

  const handlePackageClick = (pkg: package_table) => {
    const transactionId = `TR-${pkg.package_id}-${generateRandomNumberAndLetter()}`;
    router.push(
      `/subscription/avail?transaction_id=${encodeURIComponent(transactionId)}`
    );
  };

  return (
    <div className="grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {packages.map((pkg) => (
        <PackageCard
          key={pkg.package_id}
          packages={pkg}
          onClick={() => handlePackageClick(pkg)}
        />
      ))}

      {/* <AvailPackagePage
        setSelectedPackage={setSelectedPackage}
        selectedPackage={selectedPackage}
      /> */}
    </div>
  );
};

export default DashboardDepositModalPackages;
