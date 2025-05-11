import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PackageCard from "@/components/ui/packageCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { package_table } from "@prisma/client";
import { useState } from "react";

type Props = {
  className: string;
  packages: package_table[];
};

const DashboardReinvestPromoPackage = ({ packages: initialPackage }: Props) => {
  const [selectedPackage, setSelectedPackage] = useState<package_table | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(false);

  const handlePackageSelect = (pkg: package_table) => {
    setSelectedPackage(pkg);
    setIsOpen(true);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setIsOpen(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          className="p-2 shadow-none rounded-lg  flex flex-col items-center justify-center relative text-balance h-10 w-full text-white"
          variant="outline"
          onClick={() => setIsOpen(true)}
        >
          CLICK HERE TO REINVEST
        </Button>
      </DialogTrigger>

      <DialogContent
        type="earnings"
        className={`sm:max-w-[425px] bg-orange-950 dark:bg-orange-950`}
      >
        <ScrollArea className="h-[650px] sm:h-fit">
          <DialogHeader>
            <DialogTitle>{selectedPackage?.package_name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col justify-between gap-4">
            {initialPackage.map((pkg) => (
              <PackageCard
                key={pkg.package_id}
                packages={pkg}
                selectedPackage={selectedPackage || null}
                onClick={() => handlePackageSelect(pkg)}
                type="reinvest"
              />
            ))}
          </div>
          <DialogFooter></DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardReinvestPromoPackage;
