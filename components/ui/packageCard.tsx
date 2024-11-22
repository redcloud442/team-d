import Link from "next/link";
import { Button } from "./button";
import { Card } from "./card";

type Props = {
  packageName: string;
  packageDescription: string;
  packagePercentage: string;
  packageDays: string;
  href?: string;
};

const PackageCard = ({
  packageName,
  packageDescription,
  packagePercentage,
  packageDays,
  href,
}: Props) => {
  return (
    <Card className="bg-white border border-gray-200 rounded-lg shadow-md p-6 flex flex-col items-center space-y-4">
      {/* Package Name */}
      <h2 className="text-xl font-bold ">{packageName}</h2>

      {/* Package Description */}
      <p className="text-gray-600 text-center">{packageDescription}</p>

      {/* Package Details */}
      <p className="text-2xl text-center font-extrabold text-gray-800">
        {packagePercentage} Earnings in {packageDays} Days
      </p>

      {href && (
        <Link href={href} className="w-full">
          <Button className="w-full  text-white font-semibold py-2">
            Select
          </Button>
        </Link>
      )}
    </Card>
  );
};

export default PackageCard;
