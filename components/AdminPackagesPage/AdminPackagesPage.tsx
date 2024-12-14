"use client";

import { logError } from "@/services/Error/ErrorLogs";
import { getAdminPackages } from "@/services/Package/Admin";
import { createClientSide } from "@/utils/supabase/client";
import { alliance_member_table, package_table } from "@prisma/client";
import { useEffect, useState } from "react";
import EditPackagesModal from "../AdminPackagesPage/EditPackagesModal";
import { Card } from "../ui/card";

type Props = {
  teamMemberProfile: alliance_member_table;
};

const AdminPackageList = ({ teamMemberProfile }: Props) => {
  const supabase = createClientSide();
  const [packages, setPackages] = useState<package_table[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<package_table | null>(
    null
  );

  const fetchPackages = async () => {
    try {
      if (!teamMemberProfile) return;
      const fetchedPackages = await getAdminPackages(supabase, {
        teamMemberId: teamMemberProfile.alliance_member_id,
      });

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

  const handleSelectPackage = (pkg: package_table) => {
    setSelectedPackage(pkg);
  };

  return (
    <div className="container mx-auto p-10">
      <h1 className="Title">List of Packages</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packages.map((pkg) => (
          <Card
            key={pkg.package_id}
            className="bg-white border border-gray-200 rounded-lg shadow-md p-6 flex flex-col items-center space-y-4"
          >
            <h2 className="text-xl font-bold">{pkg.package_name}</h2>
            <p className="text-gray-600 dark:text-white text-center">
              {pkg.package_description}
            </p>
            <p className="text-2xl text-center font-extrabold text-gray-800 dark:text-white">
              {pkg.package_percentage} Earnings in {pkg.packages_days} Days
            </p>

            <EditPackagesModal
              teamMemberProfile={teamMemberProfile}
              selectedPackage={selectedPackage}
              handleSelectPackage={() => handleSelectPackage(pkg)}
              fetchPackages={fetchPackages}
            />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminPackageList;
