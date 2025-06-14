"use client";

import AvailPackagePage from "@/components/AvailPackagePage/AvailPackagePage";
import PackageCard from "@/components/ui/packageCard";
import { Separator } from "@/components/ui/separator";
import { useUserEarningsStore } from "@/store/useUserEarningsStore";
import { formatNumberLocale } from "@/utils/function";
import { package_table, PurchaseSummary } from "@/utils/types";
import { useState } from "react";

type Props = {
  packages: package_table[];
  purchaseSummary: PurchaseSummary;
};

const DashboardDepositModalPackages = ({
  packages,
  purchaseSummary,
}: Props) => {
  const { earnings } = useUserEarningsStore();
  const [selectedPackage, setSelectedPackage] = useState<package_table | null>(
    null
  );
  const [summary, setSummary] = useState<PurchaseSummary>(purchaseSummary);

  const handlePackageClick = (pkg: package_table) => {
    setSelectedPackage(pkg);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-center items-center border-2 border-bg-primary-blue rounded-lg p-4">
        <span className="text-2xl font-normal text-bg-primary-blue">
          Available Balance
        </span>
        <span className="text-lg font-normal text-white">
          {formatNumberLocale(earnings?.company_combined_earnings || 0)}
        </span>
      </div>

      {/* Step Indicator */}
      {!selectedPackage && (
        <div className="relative mt-10">
          <div className="flex items-center justify-around sm:justify-evenly gap-2">
            <div className="w-10 h-10 bg-gray-100 text-black rounded-full flex items-center justify-center text-sm font-medium">
              1
            </div>

            <div className="w-10 h-10  bg-bg-primary-blue text-black rounded-full flex items-center justify-center text-sm font-medium">
              2
            </div>
          </div>
          <div className="flex justify-center absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-1/2 ">
            <span className="text-2xl font-normal text-white text-center">
              Select Plan
            </span>
          </div>
          <div className="flex justify-center absolute  left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-26 sm:w-40">
            <Separator
              orientation="vertical"
              className="h-1  w-full dark:bg-gray-200"
            />
          </div>
        </div>
      )}

      {!selectedPackage ? (
        <div className="grid grid-cols-2 justify-around w-full gap-4">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.package_id}
              packages={pkg}
              purchaseSummary={summary}
              onClick={() => handlePackageClick(pkg)}
            />
          ))}
        </div>
      ) : (
        <>
          <div className="relative mt-10">
            <div className="flex items-center justify-around sm:justify-evenly gap-2">
              <div className="w-10 h-10 bg-gray-100 text-black rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>

              <div className="w-10 h-10  bg-bg-primary-blue text-black rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
            </div>
            <div className="flex justify-center absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-1/2 ">
              <span className="text-2xl font-normal text-white text-center">
                Input Amount
              </span>
            </div>
            <div className="flex justify-center absolute  left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-26 sm:w-40">
              <Separator
                orientation="vertical"
                className="h-1  w-full dark:bg-gray-200"
              />
            </div>
          </div>
          <AvailPackagePage
            setSummary={setSummary}
            packagePurchaseSummary={summary}
            selectedPackage={selectedPackage}
            setSelectedPackage={setSelectedPackage}
          />
        </>
      )}
    </div>
  );
};

export default DashboardDepositModalPackages;
