import AvailPackagePage from "@/components/AvailPackagePage/AvailPackagePage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PackageCard from "@/components/ui/packageCard";
import { getPackageModalData } from "@/services/Package/Member";
import { createClientSide } from "@/utils/supabase/client";
import { ChartDataMember } from "@/utils/types";
import {
  alliance_earnings_table,
  alliance_member_table,
  package_table,
} from "@prisma/client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

type Props = {
  teamMemberProfile: alliance_member_table;
  packages: package_table[];
  earnings: alliance_earnings_table;
  setEarnings: Dispatch<SetStateAction<alliance_earnings_table>>;
  setChartData: Dispatch<SetStateAction<ChartDataMember[]>>;
};

const DashboardDepositModalPackages = ({
  packages: initialPackage,
  teamMemberProfile,
  earnings,
  setEarnings,
  setChartData,
}: Props) => {
  const supabaseClient = createClientSide();
  const [open, setOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<package_table | null>(
    null
  );
  const [packages, setPackages] = useState<package_table[]>(initialPackage);
  const handlePackageSelect = (pkg: package_table) => {
    setSelectedPackage(pkg);
  };

  useEffect(() => {
    const packagesData = async () => {
      try {
        if (!open) return;
        const data = await getPackageModalData(supabaseClient, {
          teamMemberId: teamMemberProfile.alliance_member_id,
        });

        setPackages(data);
      } catch (e) {}
    };

    packagesData();
  }, [teamMemberProfile, open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          setSelectedPackage(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Packages
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buy Packages</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        {selectedPackage ? (
          <AvailPackagePage
            setOpen={setOpen}
            earnings={earnings}
            pkg={selectedPackage}
            teamMemberProfile={teamMemberProfile}
            setEarnings={setEarnings}
            setChartData={setChartData}
          />
        ) : (
          packages.map((pkg) => (
            <PackageCard
              key={pkg.package_id}
              packageName={pkg.package_name}
              packageDescription={pkg.package_description}
              packagePercentage={`${pkg.package_percentage} %`}
              packageDays={String(pkg.packages_days)}
              onClick={() => handlePackageSelect(pkg)}
            />
          ))
        )}

        <DialogFooter>
          {selectedPackage && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSelectedPackage(null)}
            >
              Back to Packages
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardDepositModalPackages;
