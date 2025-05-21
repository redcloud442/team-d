"use client";

import { logError } from "@/services/Error/ErrorLogs";
import { getAdminPackages } from "@/services/Package/Admin";
import { useRole } from "@/utils/context/roleContext";
import { createClientSide } from "@/utils/supabase/client";
import { package_table } from "@/utils/types";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";

const AdminPackageList = () => {
  const supabase = createClientSide();
  const { teamMemberProfile } = useRole();
  const [packages, setPackages] = useState<package_table[]>([]);

  const fetchPackages = async () => {
    try {
      if (!teamMemberProfile) return;

      const fetchedPackages = await getAdminPackages();

      setPackages(fetchedPackages);
    } catch (e) {
      if (e instanceof Error) {
        await logError(supabase, {
          errorMessage: e.message,
          stackTrace: e.stack,
          stackPath: "components/AdminPackagesPage/AdminPackagesPage.tsx",
        });
      }
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [teamMemberProfile, supabase]);

  return (
    <div className="container mx-auto p- md:p-10 space-y-6 ">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
          List of Packages
        </h1>
        {/* <CreatePackageModal setPackages={setPackages} /> */}
      </div>
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packages.map((pkg) => (
          <Card
            key={pkg.package_id}
            style={{
              background: pkg.package_is_disabled
                ? "gray"
                : `linear-gradient(110deg,"#F6DB4E"} 60%, #ED9738)`, // Make package color dominate
            }}
            className={`border rounded-lg h-auto shadow-md p-6 flex flex-col items-center space-y-4 ${
              pkg.package_is_disabled
                ? "bg-gray-200 border-gray-400 opacity-50"
                : "border-gray-200"
            }`}
          >
            <Image
              src={pkg.package_image || "/images/package-default.png"}
              alt={pkg.package_name}
              width={300}
              height={300}
              className="object-cover"
            />
            <h2
              className={`text-xl font-bold ${pkg.package_is_disabled ? "text-gray-500" : ""}`}
            >
              {pkg.package_name}
            </h2>
            <p
              className={`text-center ${pkg.package_is_disabled ? "text-gray-500" : "text-gray-600 dark:text-white"}`}
            >
              {pkg.package_description}
            </p>
            <p
              className={`text-2xl text-center font-extrabold ${
                pkg.package_is_disabled
                  ? "text-gray-500"
                  : "text-gray-800 dark:text-white"
              }`}
            >
              {pkg.package_percentage}% Earnings in {pkg.packages_days} Days
            </p>

            {/* {!pkg.package_is_disabled && (
              <EditPackagesModal
                setPackages={setPackages}
                teamMemberProfile={teamMemberProfile}
                selectedPackage={selectedPackage}
                handleSelectPackage={() => handleSelectPackage(pkg)}
              />
            )} */}

            {pkg.package_is_disabled && (
              <div className="text-sm text-gray-500 italic">
                This package is currently disabled
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminPackageList;
