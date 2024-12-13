"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRole } from "@/utils/context/roleContext";
import { createClientSide } from "@/utils/supabase/client";
import { alliance_member_table } from "@prisma/client";
import { ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NavigationLoader from "./NavigationLoader";

type Props = {
  teamMemberProfile: alliance_member_table;
};

const NavBar = ({ teamMemberProfile }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientSide();
  const { userName } = useRole();
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigation = (url: string) => {
    if (pathname !== url) {
      setIsLoading(true);
      router.push(url);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      router.refresh();
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsLoading(false);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="w-full bg-gray-600 dark:bg-gray-700 text-white shadow-lg z-50">
      <NavigationLoader visible={isLoading} />
      <div className="w-full mx-auto px-4 flex justify-between items-center h-16">
        {/* Logo Section */}
        <Button
          variant="ghost"
          className="text-xl font-bold cursor-pointer"
          onClick={() => handleNavigation("/")}
        >
          Logo Here
        </Button>

        {/* Navigation Links */}
        <div className="hidden items-center space-x-4 md:flex">
          {/* <Button
            variant="ghost"
            onClick={() => handleNavigation("/direct-loot")}
          >
            Direct Referral
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleNavigation("/indirect-loot")}
          >
            Indirect Referral
          </Button> */}
          {teamMemberProfile.alliance_member_role === "MERCHANT" && (
            <>
              <Button
                variant="ghost"
                onClick={() => handleNavigation("/top-up")}
              >
                Top Up
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleNavigation("/merchant")}
              >
                Merchant
              </Button>
            </>
          )}
          {teamMemberProfile.alliance_member_role === "ACCOUNTING" && (
            <Button
              variant="ghost"
              onClick={() => handleNavigation("/withdraw")}
            >
              Withdrawal
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                Hello, {userName}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleNavigation("/profile")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
