import { packageMap } from "@/utils/constant";
import { package_table, PurchaseSummary } from "@/utils/types";
import { CrownIcon } from "lucide-react";
import Image from "next/image";
import { Badge } from "./badge";

type Props = {
  packages: package_table & {
    package_features_table: {
      package_features_description: { text: string; value: string }[];
    }[];
  };
  type?: "reinvest" | "avail";
  onClick: (packageID: string) => void;
  purchaseSummary: PurchaseSummary;
};

const PackageCard = ({ packages, onClick, purchaseSummary }: Props) => {
  return (
    <div className="relative grid grid-cols-2 gap-6">
      {/* Left: Image */}
      <div className="relative flex flex-col justify-center items-center w-full gap-2 sm:w-[180px]">
        <Image
          src={packages.package_image || ""}
          alt={packages.package_name}
          width={200}
          height={200}
          priority
          className="rounded-lg border-2 cursor-pointer object-contain hover:scale-105 duration-300 transition-transform duration-200 active:scale-95"
          onClick={() => onClick(packages.package_id)}
        />
        <Badge className="dark:bg-bg-primary-blue text-md font-bold px-1 rounded">
          {packages.packages_days} DAYS
        </Badge>
      </div>

      {/* Right: Info */}
      <div className=" text-white">
        <div className="flex flex-col justify-center items-center sm:items-start">
          {packages.package_is_popular && (
            <p className="text-[9px] font-semibold">MOST POPULAR</p>
          )}
          {packages.package_is_highlight && (
            <p className="text-[9px] font-semibold">
              <CrownIcon className="text-bg-primary-blue" />
            </p>
          )}
          <h2 className="text-xl text-bg-primary-blue flex items-center gap-1 uppercase font-black">
            {packages.package_name}{" "}
            {packages.package_is_popular && (
              <span className="text-teal-300">★</span>
            )}
            (
            {
              purchaseSummary[
                packageMap[packages.package_name as keyof typeof packageMap]
              ]
            }{" "}
            / {packages.package_limit})
          </h2>
        </div>

        <ul className="mt-2 space-y-1 text-sm">
          {packages.package_features_table.map((feature, index) => {
            const description = feature.package_features_description;

            return description.map((item, subIndex) => {
              const highlighted = item.text.replace(
                item.value,
                `<span class='text-bg-primary-blue font-bold'>${item.value}</span>`
              );

              return (
                <li
                  key={`${index}-${subIndex}`}
                  className="flex items-start gap-1"
                >
                  <span className="text-bg-primary-blue font-bold">✓</span>
                  <span
                    className="text-white"
                    dangerouslySetInnerHTML={{ __html: highlighted }}
                  />
                </li>
              );
            });
          })}
        </ul>
      </div>
    </div>
  );
};

export default PackageCard;
