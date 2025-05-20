"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { usePackageChartData } from "@/store/usePackageChartData";
import { useUserDashboardEarningsStore } from "@/store/useUserDashboardEarnings";
import { useUserEarningsStore } from "@/store/useUserEarningsStore";
import { LogOut, Triangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./button";
import { DialogFooter, DialogHeader } from "./dialog";
import { Separator } from "./separator";

type NavItem = {
  href: string;
  label: string;
  onClick?: () => void | Promise<void>;
};

const MobileNavBar = () => {
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
      router.push("/logout");
    } catch (e) {
    } finally {
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 shadow-md border-t-2 bg-bg-primary border-bg-primary-blue">
        <ul className="flex items-center justify-between sm:justify-around px-4 py-3 space-x-2 relative">
          <div className="flex items-center justify-center gap-x-2">
            <li className="text-white text-xs font-bold">
              <span className="text-bg-primary-blue">DIGI</span>WEALTH
            </li>

            {/* Change Password */}
            <li className="border-2 border-bg-primary-blue rounded-lg p-1">
              <Link
                href="/change-password"
                className="text-white text-xs font-bold text-center border-bg-primary-blue rounded-full"
              >
                <div className="flex flex-col items-center leading-none">
                  <span className="text-bg-primary-blue">Change</span>
                  <span className="text-white">Password</span>
                </div>
              </Link>
            </li>
          </div>
          {/* Highlighted Center Home */}
          <li className="border-2 border-bg-primary-blue bg-bg-primary rounded-full absolute bottom-[0.5px] left-1/2 -translate-x-1/2 w-18 h-18 flex items-center justify-center z-50 active:scale-105 transition-all duration-300">
            <Link
              href="/digi-dash"
              className="text-white text-center text-[12px] font-bold leading-tight  z-50"
            >
              <div className="flex flex-col items-center leading-none">
                <span className="text-bg-primary-blue">DIGI</span>
                <span>HOME</span>
              </div>
            </Link>
          </li>

          {/* Profile */}
          <div className="flex items-center justify-center gap-x-2">
            <li>
              <Link
                href="/profile"
                className="text-white text-xs font-bold px-3 py-2 border-2 border-bg-primary-blue rounded-lg hover:bg-bg-primary-blue/10 transition"
              >
                Profile
              </Link>
            </li>

            {/* Log Out */}
            <li>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-white text-xs font-bold px-3 py-2 border-2 border-bg-primary-blue rounded-lg hover:bg-bg-primary-blue/10 transition"
              >
                <span className="text-bg-primary-blue">Log</span> Out
              </button>
            </li>
          </div>
        </ul>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
          <Triangle
            className="w-12 h-12 text-bg-primary-blue"
            strokeWidth={1}
          />
        </div>
        <Separator className="dark:bg-bg-primary-blue w-full text-md absolute bottom-1 h-[2px] -z-0" />
      </nav>

      {/* Logout Confirmation Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          type="earnings"
          className="z-50 text-center dark:bg-bg-primary border border-bg-primary-blue text-white"
        >
          <DialogHeader>
            <div className="flex flex-col items-center">
              <LogOut className="w-10 h-10 text-bg-primary-blue" />
              <DialogTitle className="text-xl font-bold text-white">
                Proceed to <span className="text-bg-primary-blue">Logout</span>
              </DialogTitle>
            </div>
          </DialogHeader>
          <DialogFooter className="flex justify-center gap-4 pt-4 w-full">
            <Button
              className="w-full bg-bg-primary-blue hover:bg-bg-primary-blue/80 text-black font-bold"
              onClick={handleSignOut}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MobileNavBar;
