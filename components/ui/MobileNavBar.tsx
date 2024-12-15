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
import { DollarSign, Home, LogOut, ShoppingBag, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NavigationLoader from "./NavigationLoader";
import { Button } from "./button";

type NavItem = {
  href: string;
  label: string;
  icon: JSX.Element;
  onClick?: () => void | Promise<void>;
};

const MobileNavBar = () => {
  const supabase = createClientSide();
  const pathname = usePathname();
  const { role } = useRole();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      router.refresh();
    } catch (e) {
      console.error("Error during sign out:", e);
    } finally {
      setIsLoading(false);
      setIsModalOpen(false); // Close the modal after logout
    }
  };

  const navItems: NavItem[] = [
    { href: "/", label: "Home", icon: <Home className="w-8 h-8" /> },
    { href: "/profile", label: "Profile", icon: <User className="w-8 h-8" /> },
    ...(role === "MERCHANT"
      ? [
          {
            href: "/top-up",
            label: "Top Up",
            icon: <ShoppingBag className="w-8 h-8" />,
          },
          {
            href: "/merchant",
            label: "Merchant",
            icon: <ShoppingBag className="w-8 h-8" />,
          },
        ]
      : []),
    ...(role === "ACCOUNTING"
      ? [
          {
            href: "/withdrawal",
            label: "Withdrawal",
            icon: <DollarSign className="w-8 h-8" />,
          },
        ]
      : []),
    {
      href: "/auth/login",
      label: "Logout",
      icon: <LogOut className="w-8 h-8" />,
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
      setIsLoading(true);
      router.push(url);
    }
  };

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t dark:bg-zinc-800 shadow-md md:hidden">
        {isLoading && <NavigationLoader visible={isLoading} />}
        <ul className="flex justify-around py-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Button
                onClick={() => handleNavigation(item.href, item.onClick)}
                variant="link"
                className={cn(
                  "flex flex-col items-center text-gray-500 hover:text-black",
                  pathname === item.href && "text-black font-semibold"
                )}
              >
                {item.icon}
                <span className="text-xs">{item.label}</span>
              </Button>
            </li>
          ))}
        </ul>
      </nav>

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
