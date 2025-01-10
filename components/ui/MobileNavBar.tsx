"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useRole } from "@/utils/context/roleContext";
import { createClientSide } from "@/utils/supabase/client";
import { LogOut, User } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./button";

type NavItem = {
  href: string;
  label: string;
  icon?: JSX.Element; // "icon" is optional since "Home" uses the logo.
  onClick?: () => void | Promise<void>;
};

const MobileNavBar = () => {
  const supabase = createClientSide();
  const pathname = usePathname();
  const { role } = useRole();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (e) {
      console.error("Error during sign out:", e);
    } finally {
      setIsModalOpen(false);
    }
  };

  const navItems: NavItem[] = [
    { href: "/profile", label: "Guides", icon: <User className="w-6 h-6" /> },

    {
      href: "/auth/login",
      label: "Logout",
      icon: <LogOut className="w-6 h-6" />,
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

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-cardColor border-t border-gray-400 shadow-md xs:hidden"
        style={{
          clipPath:
            "polygon(41% 48%, 59% 48%, 59% 0, 73% 27%, 100% 5%, 100% 100%, 0 100%, 0 9%, 28% 27%, 41% 0)",
          width: "100vw",
        }}
      >
        <ul className="flex justify-between items-center py-4 border-2">
          {navItems.map((item, index) => (
            <li
              key={item.href}
              className={cn(
                index === 1 &&
                  "absolute left-1/2 transform -translate-x-1/2 top-4"
              )}
            >
              <Button
                onClick={() => handleNavigation(item.href, item.onClick)}
                variant="ghost"
                className={cn(
                  "flex flex-col items-center text-gray-500",
                  pathname === item.href && "text-black font-bold"
                )}
              >
                {item.icon}
                <span className="mt-1">{item.label}</span>
              </Button>
            </li>
          ))}
        </ul>
      </nav>
      <div
        className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center gap-4"
        style={{ width: "64px", height: "64px" }}
      >
        <Image
          src="/mobile-logo.svg"
          alt="logo"
          width={64}
          height={64}
          className="w-full h-full object-contain"
        />{" "}
      </div>

      {/* Logout Confirmation Modal */}
      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to log out?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsModalOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MobileNavBar;
