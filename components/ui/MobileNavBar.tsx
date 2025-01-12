"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { createClientSide } from "@/utils/supabase/client";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./button";
import { DialogFooter, DialogHeader } from "./dialog";

type NavItem = {
  href: string;
  label: string;
  onClick?: () => void | Promise<void>;
};

const MobileNavBar = () => {
  const supabase = createClientSide();
  const pathname = usePathname();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (e) {
    } finally {
      setIsModalOpen(false);
    }
  };

  const navItems: NavItem[] = [
    { href: "/profile", label: "Profile" },
    {
      href: "/",
      label: "Home",
    },
    {
      href: "/auth/login",
      label: "Logout",

      onClick: () => setIsModalOpen(true),
    },
  ];

  const handleNavigation = (
    url: string,
    onClick?: () => void | Promise<void>
  ) => {
    if (onClick) {
      onClick();
    } else if (pathname !== url) {
      router.push(url);
    }
  };

  // useEffect(() => {
  //   const handleFetchUserInformation = () => {
  //     try {
  //     } catch (error) {}
  //   };
  // }, []);
  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
        <ul className="flex justify-around gap-4 items-end relative z-10 ">
          {navItems.map((item) => (
            <li key={item.href}>
              <Button
                onClick={() => handleNavigation(item.href, item.onClick)}
                variant="ghost"
                className={cn(
                  "flex flex-col items-center dark:text-black dark:hover:text-white font-extrabold"
                )}
              >
                <span
                  className={cn("text-md", item.label === "Home" && "pb-4")}
                >
                  {item.label}
                </span>
              </Button>
            </li>
          ))}
        </ul>

        <div className="fixed -bottom-3 -left-24 transform translate-x-1/2 z-10 flex items-center justify-center">
          <Image
            src="/assets/guide.png"
            alt="Logo"
            width={160}
            height={160}
            className="z-10"
            priority
            onClick={() => setIsModalOpen(true)}
          />
        </div>

        {/* Centered Image */}
        <div className=" fixed block sm:hidden bottom-10 left-1/2 transform -translate-x-1/2 z-10 ">
          <Image
            src="/assets/app-logo-bg.svg"
            alt="Logo"
            width={70}
            height={70}
            className="z-10"
            priority
            onClick={() => router.push("/")}
          />
        </div>

        <div className="fixed -bottom-3 -right-24 transform -translate-x-1/2 z-10 flex items-center justify-center">
          <Image
            src="/assets/logout.png"
            alt="Logo"
            width={160}
            height={160}
            className="z-10"
            priority
            onClick={() => setIsModalOpen(true)}
          />
        </div>

        {/* Mobile Navigation Background */}

        <Image
          src="/assets/mobile-navigation.svg"
          alt="Mobile Navigation"
          width={430}
          height={60}
          priority
          style={{
            objectFit: "cover",
          }}
          className="fixed -bottom-2 left-0 right-0 z-0 w-full min-h-[115px] max-h-[115px]"
        />
      </nav>
      <div
        className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center gap-4"
        style={{ width: "64px", height: "64px" }}
      ></div>

      {/* Logout Confirmation Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="z-50">
          <DialogHeader>
            <DialogTitle>Are you sure you want to log out?</DialogTitle>
          </DialogHeader>
          <DialogDescription />

          <DialogFooter>
            <Button variant="card" onClick={handleSignOut}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MobileNavBar;
