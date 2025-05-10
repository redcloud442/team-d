"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePackageChartData } from "@/store/usePackageChartData";
import { useUserDashboardEarningsStore } from "@/store/useUserDashboardEarnings";
import { useUserEarningsStore } from "@/store/useUserEarningsStore";
import { createClientSide } from "@/utils/supabase/client";
import { History, LogOut, LogOutIcon, Mail, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./button";
import { DialogFooter, DialogHeader } from "./dialog";

type NavItem = {
  href: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void | Promise<void>;
};

const MobileNavBar = () => {
  const supabase = createClientSide();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setTotalEarnings } = useUserDashboardEarningsStore();
  const { setEarnings } = useUserEarningsStore();
  const { setChartData } = usePackageChartData();

  const handleSignOut = async () => {
    try {
      setTotalEarnings(null);
      setEarnings(null);
      setChartData([]);
      await supabase.auth.signOut();
      localStorage.removeItem("isModalOpen");
      router.push("/auth/login");
    } catch (e) {
    } finally {
      setIsModalOpen(false);
    }
  };

  const navItems: NavItem[] = [
    {
      href: "/profile",
      label: "Profile",
      icon: <User className="h-8 w-8" />,
    },
    {
      href: "/inbox",
      label: "Inbox",
      icon: <Mail className="h-8 w-8" />,
    },
    {
      href: "/dashboard",
      label: "Home",
      icon: (
        <Image src="/assets/icons/logo.ico" alt="Home" width={45} height={45} />
      ),
    },
    {
      href: "/history",
      label: "History",
      icon: <History className="h-8 w-8" />,
    },
    {
      href: "/logout",
      label: "Logout",
      icon: <LogOutIcon className="h-8 w-8" />,
      onClick: () => setIsModalOpen(true),
    },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-orange-950 shadow-md border-t-4 border-orange-500">
        <ul className="flex sm:justify-around justify-between items-center px-4 py-2">
          {navItems.map((item) => (
            <li key={item.href}>
              {item.href === "/logout" ? (
                <div
                  onClick={() => setIsModalOpen(true)}
                  className="flex flex-col gap-1 items-center font-extrabold text-orange-500"
                >
                  {item.icon}
                  <span className="text-[10px] text-white font-bold">
                    {item.label}
                  </span>
                </div>
              ) : (
                <Link
                  href={item.href}
                  className="flex flex-col gap-1 items-center font-extrabold text-orange-500"
                >
                  {item.icon}
                  <span className="text-[10px] text-white font-bold">
                    {item.label}
                  </span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Confirmation Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="z-50 text-center space-y-4">
          <DialogHeader>
            <div className="flex flex-col items-center space-y-2">
              <LogOut className="w-10 h-10 text-red-500" />
              <DialogTitle className="text-xl font-bold">
                Confirm Logout
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Are you sure you want to sign out? You’ll need to log in again
                to access your account.
              </DialogDescription>
            </div>
          </DialogHeader>

          <DialogFooter className="flex justify-center gap-4 pt-4">
            <Button variant="destructive" onClick={handleSignOut}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MobileNavBar;
