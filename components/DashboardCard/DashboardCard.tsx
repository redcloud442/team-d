import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

type DashboardCardProps = {
  imageSrc: string;
  imageAlt?: string;
  buttons: { label: string; href: string; disabled?: boolean }[];
};

const DashboardCard = ({
  imageSrc,
  imageAlt = "Card Image",
  buttons,
}: DashboardCardProps) => {
  return (
    <div className="flex items-center justify-around p-3 rounded-xl border border-white w-full mt-5">
      {/* Left: Image */}
      <div className="relative">
        <Image src={imageSrc} alt={imageAlt} width={140} height={140} />
      </div>

      {/* Right: Buttons */}
      <div className="flex flex-col gap-4">
        {buttons.map((btn, index) => (
          <Link href={btn.disabled ? "#" : btn.href} key={index}>
            <Button
              className="bg-bg-primary-blue text-black text-md font-black px-4 h-6 rounded-md hover:brightness-110 transition w-full"
              disabled={btn.disabled}
            >
              {btn.label}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DashboardCard;
