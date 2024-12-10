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
import {
  alliance_earnings_table,
  alliance_member_table,
  package_table,
} from "@prisma/client";
import { Dispatch, SetStateAction, useState } from "react";

type Props = {
  teamMemberProfile: alliance_member_table;
  packages: package_table[];
  earnings: alliance_earnings_table;
  setEarnings: Dispatch<SetStateAction<alliance_earnings_table>>;
};

const DashboardDepositModalPackages = ({
  packages,
  teamMemberProfile,
  earnings,
  setEarnings,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<package_table | null>(
    null
  );

  const handlePackageSelect = (pkg: package_table) => {
    setSelectedPackage(pkg);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            <Button variant="outline" onClick={() => setSelectedPackage(null)}>
              Back to Packages
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardDepositModalPackages;
