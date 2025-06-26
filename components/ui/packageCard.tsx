import { package_table } from "@/utils/types";
import Image from "next/image";
import { Button } from "./button";

type Props = {
  packages: package_table;
  type?: "reinvest" | "avail";
  onClick: (packageID: string) => void;
};

const PackageCard = ({ packages, onClick }: Props) => {
  return (
    <div className="relative gap-6 flex flex-col justify-center items-center">
      {/* Left: Image */}
      <div className="relative flex flex-col justify-center items-center w-[130px] gap-2">
        <Image
          src={packages.package_image || ""}
          alt={packages.package_name}
          width={140}
          height={140}
          priority
          className="rounded-lg  cursor-pointer object-contain hover:scale-105 duration-300 transition-transform duration-200 active:scale-95 "
        />
        <Button
          onClick={() => onClick(packages.package_id)}
          className="px-4 py-2"
        >
          Select
        </Button>
      </div>  

      {/* Right: Info */}
    </div>
  );
};

export default PackageCard;
