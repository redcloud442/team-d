import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

type DashboardCommunityCardProps = {
  imageSrc: string;
  imageAlt?: string;
  href: string;
  label: string;
};

const DashboardCommunityCard = ({
  imageSrc,
  imageAlt = "Card Image",
  href,
  label,
}: DashboardCommunityCardProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex items-center justify-around p-3 rounded-xl border border-white w-full mt-5">
        {/* Left: Image */}
        <div className="relative">
          <Image src={imageSrc} alt={imageAlt} width={200} height={200} />
        </div>

        {/* Right: Buttons */}
      </div>
      <Link href={href}>
        <Button className="bg-bg-primary-blue text-black text-md font-black px-4 h-6 rounded-md hover:brightness-110 transition">
          {label}
        </Button>
      </Link>
    </div>
  );
};

export default DashboardCommunityCard;
