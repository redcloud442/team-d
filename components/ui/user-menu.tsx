import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useUserHaveAlreadyWithdraw } from "@/store/useWithdrawalToday";
import { Coins, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const UserMenu = () => {
  const pathname = usePathname();
  const MenuItems = {
    main: [
      {
        label: "Dashboard",
        icon: (
          <Image
            src="/assets/icons/dashboard.ico"
            alt="Dashboard"
            width={24}
            height={24}
            className="w-6 h-6 text-bg-primary-blue"
          />
        ),
        href: "/digi-dash",
      },
      {
        label: "Deposit",
        icon: (
          <Image
            src="/assets/icons/deposit.ico"
            alt="Dashboard"
            width={24}
            height={24}
            className="w-6 h-6 text-bg-primary-blue"
          />
        ),
        href: "/request/deposit",
      },
      {
        label: "Withdraw",
        icon: (
          <Image
            src="/assets/icons/withdrawal.ico"
            alt="Dashboard"
            width={24}
            height={24}
            className="w-6 h-6 text-bg-primary-blue"
          />
        ),
        href: "/request/withdraw",
      },
      {
        label: "Subscribe to Earn",
        icon: (
          <Image
            src="/assets/icons/subscribe.ico"
            alt="Dashboard"
            width={24}
            height={24}
            className="w-6 h-6 text-bg-primary-blue"
          />
        ),
        href: "/subscription",
      },
      {
        label: "History",
        icon: <Coins className="w-6 h-6 text-bg-primary-blue" />,
        href: "/history/deposit",
      },
      {
        label: "Referrals",
        icon: (
          <Image
            src="/assets/icons/referrals.ico"
            alt="Dashboard"
            width={24}
            height={24}
            className="w-6 h-6 text-bg-primary-blue"
          />
        ),
        href: "/referral/new-register",
      },
    ],
    secondary: [
      {
        label: "Change Password",
        icon: (
          <Image
            src="/assets/icons/change-password.ico"
            alt="Dashboard"
            width={24}
            height={24}
            className="w-6 h-6 text-bg-primary-blue"
          />
        ),
        href: "/change-password",
      },
      {
        label: "Logout",
        icon: (
          <Image
            src="/assets/icons/logout.ico"
            alt="Dashboard"
            width={24}
            height={24}
            className="w-6 h-6 text-bg-primary-blue"
          />
        ),
        href: "/logout",
      },
    ],
  };

  const [open, setOpen] = useState(false);
  const { canUserDeposit, isWithdrawalToday } = useUserHaveAlreadyWithdraw();

  const getLinkHref = (itemHref: string) => {
    if (
      itemHref === "/request/withdraw" &&
      !isWithdrawalToday.package &&
      !isWithdrawalToday.referral
    ) {
      return "#";
    }

    if (itemHref === "/request/deposit" && !canUserDeposit) {
      return "#";
    }

    return itemHref;
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="absolute top-14 left-4 cursor-pointer">
        <Menu />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            <div
              className={`flex items-center justify-center w-full relative mb-10 `}
            >
              <Image
                src="/assets/icons/digi.webp"
                alt="DigiWealth Logo"
                width={100}
                height={100}
                className="w-26 h-auto absolute top-2 left-7 -translate-y-1/2 -translate-x-1/2"
                priority
              />

              <span className="text-2xl font-black text-white">DIGIWEALTH</span>
            </div>
          </SheetTitle>

          <SheetDescription className="hidden"> </SheetDescription>

          <h1 className="text-xl font-bold wtext-white text-start">MENU</h1>
          <div className="flex flex-col gap-y-4 mb-12">
            {MenuItems.main.map((item) => (
              <Link
                href={getLinkHref(item.href)}
                key={item.label}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-x-2 text-white hover:text-white/80 text-xl ${
                  pathname === item.href
                    ? "bg-bg-primary-blue/20 rounded-md px-2 py-1"
                    : "text-white hover:text-white/80"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>

          <h1 className="text-xl font-bold text-white text-start">
            PREFERENCE
          </h1>
          <div className="flex flex-col gap-y-4 mb-6">
            {MenuItems.secondary.map((item) => (
              <Link
                href={item.href}
                key={item.label}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-x-2 text-white hover:text-white/80 text-xl ${
                  pathname === item.href
                    ? "bg-bg-primary-blue/20 rounded-md px-2 py-1"
                    : "text-white hover:text-white/80"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default UserMenu;
