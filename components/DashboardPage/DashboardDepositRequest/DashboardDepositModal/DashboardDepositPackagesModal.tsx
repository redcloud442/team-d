"use client";

import AvailPackagePage from "@/components/AvailPackagePage/AvailPackagePage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PackageCard from "@/components/ui/packageCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getPackageModalData } from "@/services/Package/Member";
import { useUserEarningsStore } from "@/store/useUserEarningsStore";
import { formatNumberLocale } from "@/utils/function";
import { package_table } from "@/utils/types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const DashboardDepositModalPackages = () => {
  const { earnings } = useUserEarningsStore();
  const [open, setOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<package_table | null>(
    null
  );

  const { data: packages } = useQuery({
    queryKey: ["packages"],
    queryFn: () => getPackageModalData(),
    enabled: open,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  const handlePackageClick = (pkg: package_table) => {
    setSelectedPackage(pkg);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-12 text-xl font-bold w-full">Select Plan</Button>
      </DialogTrigger>
      <DialogContent type="table">
        <DialogHeader className="hidden">
          <DialogTitle>Available Packages</DialogTitle>
          <DialogDescription>
            Please select a package to deposit.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="sm:h-auto h-[600px] space-y-4">
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
                  <div className="w-10 h-10 bg-bg-primary-blue text-black rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>

                  <div className="w-10 h-10  bg-gray-100 text-black rounded-full flex items-center justify-center text-sm font-medium">
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
                {packages?.map((pkg) => (
                  <PackageCard
                    key={pkg.package_id}
                    packages={pkg}
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
                  setOpen={setOpen}
                  selectedPackage={selectedPackage}
                  setSelectedPackage={setSelectedPackage}
                />
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardDepositModalPackages;
