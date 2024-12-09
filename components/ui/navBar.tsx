"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClientSide } from "@/utils/supabase/client";
import { user_table } from "@prisma/client";
import { ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NavigationLoader from "./NavigationLoader";

type Props = {
  userData: user_table;
};

const NavBar = ({ userData }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientSide();
  const [isLoading, setIsLoading] = useState(false);

  // Navigation handler
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

  // Reset loader on pathname change
  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  // Reset loader on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsLoading(false);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="w-full sticky top-0 bg-gray-800 text-white shadow-lg z-50">
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
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                Hello, {userData.user_first_name} {userData.user_last_name}{" "}
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
