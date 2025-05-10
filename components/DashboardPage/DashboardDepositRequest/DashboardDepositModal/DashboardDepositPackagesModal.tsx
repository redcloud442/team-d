"use client";

import PackageCard from "@/components/ui/packageCard";
import { package_table } from "@prisma/client";
import { useState } from "react";

type Props = {
  packages: package_table[];
};

const DashboardDepositModalPackages = ({ packages }: Props) => {
  const [selectedPackage, setSelectedPackage] = useState<package_table | null>(
    null
  );

  const handlePackageSelect = (pkg: package_table) => {
    setSelectedPackage(pkg);
  };

  return (
    <div className="grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {packages.map((pkg) => (
        <PackageCard
          key={pkg.package_id}
          packages={pkg}
          selectedPackage={selectedPackage}
          onClick={() => handlePackageSelect(pkg)}
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
