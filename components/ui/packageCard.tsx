import { packageMap } from "@/utils/constant";
import { package_table, PurchaseSummary } from "@/utils/types";
import Image from "next/image";
import { Button } from "./button";

type Props = {
  packages: package_table;
  type?: "reinvest" | "avail";
  onClick: (packageID: string) => void;
  purchaseSummary: PurchaseSummary;
};

const PackageCard = ({ packages, onClick, purchaseSummary }: Props) => {
  return (
    <div className="relative gap-6 flex flex-col justify-center items-center">
      {/* Left: Image */}
      <div className="relative flex flex-col justify-center items-center w-[130px] gap-2">
        <div className=" text-white">
          <div className="flex flex-col justify-center items-center sm:items-start">
            <h2 className="text-xl text-white flex items-center gap-1 uppercase font-black">
              (
              {
                purchaseSummary[
                  packageMap[packages.package_name as keyof typeof packageMap]
                ]
              }{" "}
              / {packages.package_limit})
            </h2>
          </div>
        </div>
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
          disabled={
            purchaseSummary[
              packageMap[packages.package_name as keyof typeof packageMap]
            ] >= (packages.package_limit ?? 0)
          }
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
