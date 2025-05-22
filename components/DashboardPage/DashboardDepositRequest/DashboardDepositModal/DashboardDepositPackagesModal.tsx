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
    <div className="flex flex-col justify-center items-center">
      <div className="flex flex-col justify-center max-w-md gap-4">
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
    </div>
  );
};

export default DashboardDepositModalPackages;
