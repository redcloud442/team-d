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
import { ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const NavBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientSide();
  const { teamMemberProfile, profile } = useRole();

  const handleNavigation = (url: string) => {
    if (pathname !== url) {
      router.push(url);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (e) {
    } finally {
    }
  };

  return (
    <nav className="w-full bg-gray-600 dark:bg-gray-700 text-white shadow-lg z-50">
      <div className="w-full mx-auto px-4 flex justify-between items-center h-16">
        {/* Logo Section */}
        <Button
          variant="ghost"
          className="text-xl font-bold cursor-pointer"
          onClick={() => handleNavigation("/")}
        >
          ELEVATE
        </Button>

        {/* Navigation Links */}
        <div className="hidden items-center space-x-4 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                Hello, {profile.user_first_name} {profile.user_last_name}
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
