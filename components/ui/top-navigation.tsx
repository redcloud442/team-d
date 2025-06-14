import Image from "next/image";
import { usePathname } from "next/navigation";
import UserMenu from "./user-menu";

const TopNavigation = () => {
  const pathname = usePathname();
  return (
    <nav
      className={`flex bg-bg-primary pt-14 pb-4 ${
        pathname === "/digi-dash" ? "justify-center" : "justify-center"
      }`}
    >
      <UserMenu />
      <div
        className={`flex items-center relative ${
          pathname === "/digi-dash" ? "justify-center" : "justify-center"
        }`}
      >
        <Image
          src="/assets/icons/digi.webp"
          alt="DigiWealth Logo"
          width={80}
          height={80}
          className="w-26 h-auto absolute top-0 -left-4 -translate-y-1/2 -translate-x-1/2"
          priority
        />

        <div className=" ">
          <span className="text-2xl font-black text-white ">DIGIWEALTH</span>
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;
