import Link from "next/link";
import { Button } from "./button";
import { Card } from "./card";

type Props = {
  packageName: string;
  packageDescription: string;
  packagePercentage: string;
  packageDays: string;
  href?: string;
  onClick?: () => void;
  type?: "ADMIN" | "MEMBER";
};

const PackageCard = ({
  packageName,
  packageDescription,
  packagePercentage,
  packageDays,
  href,
  onClick,
  type = "MEMBER",
}: Props) => {
  return (
    <Card
      onClick={onClick}
      className="relative border border-gray-400 rounded-lg cursor-pointer shadow-lg p-6 flex flex-col items-center space-y-4 animate-tracing-border "
    >
      <h2 className="text-xl font-bold z-10">{packageName}</h2>

      <p className="text-gray-600 text-center dark:text-white z-10">
        {packageDescription}
      </p>
      <p className="text-2xl text-center font-extrabold text-gray-800 dark:text-white z-10">
        {packagePercentage} Earnings in {packageDays}{" "}
        {Number(packageDays) > 1 ? `Days` : ` Day`}
      </p>

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
