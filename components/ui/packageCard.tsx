import { package_table } from "@prisma/client";
import Image from "next/image"; // Import Next.js Image component
import Link from "next/link";
import { Button } from "./button";
import { Card } from "./card";

type Props = {
  onClick: () => void;
  packageName: string;
  selectedPackage: package_table | null;
  packageDescription?: string;
  packagePercentage?: string;
  packageDays?: string;
  packageColor?: string;
  packageId?: string;
  packageImage?: string;
  href?: string;
  type?: string;
};

const PackageCard = ({
  packageId,
  packageName,
  selectedPackage,
  onClick,
  packageDescription,
  packageColor,
  type,
  packageImage,
  href,
}: Props) => {
  return (
    <Card
      onClick={onClick}
      style={{
        background: `linear-gradient(110deg, ${packageColor || "#F6DB4E"} 60%, #ED9738)`,
      }}
      className={`w-full rounded-lg cursor-pointer shadow-lg  flex flex-col items-center justify-center space-y-4 relative overflow-hidden ${
        selectedPackage?.package_id === packageId
          ? "border-2 dark:border-pageColor shadow-lg animate-pulse"
          : "border-none"
      }`}
    >
      {/* Responsive Image */}
      {packageImage && (
        <div className="w-full relative">
          <Image
            src={packageImage}
            alt={`${packageName} image`}
            width={400}
            height={300}
            style={{ objectFit: "cover" }}
            className="rounded-lg"
          />
        </div>
      )}

      {href && type === "MEMBER" && (
        <Link href={href} className="w-full z-10">
          <Button className="w-full text-white font-semibold py-2">
            Select
          </Button>
        </Link>
      )}
    </Card>
  );
};

export default PackageCard;
