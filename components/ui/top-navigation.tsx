import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TopNavigation = () => {
  const pathname = usePathname();
  return (
    <nav
      className={`flex bg-bg-primary pt-4 ${
        pathname === "/digi-dash" ? "justify-center" : "justify-start"
      }`}
    >
      <div
        className={`flex items-end relative ${
          pathname === "/digi-dash"
            ? "-translate-x-8 justify-center"
            : "translate-x-1"
        }`}
      >
        <Link href="/digi-dash">
          <Image
            src="/assets/icons/IconGif.webp"
            alt="DigiWealth Logo"
            width={100}
            height={100}
            className="w-20 h-auto"
            priority
          />
        </Link>

        <div className="flex items-center justify-center absolute bottom-1 left-12">
          <span className="text-xs font-black text-bg-primary-blue">DIGI</span>
          <span className="text-xs font-black text-white">WEALTH</span>
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;
