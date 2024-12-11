"use client";

import { cn } from "@/lib/utils";
import { Group, Home, User, Users2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NavigationLoader from "./NavigationLoader";
import { Button } from "./button";

const MobileNavBar = () => {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const navItems = [
    { href: "/", label: "Home", icon: <Home className="w-8 h-8" /> },
    { href: "/profile", label: "Profile", icon: <User className="w-8 h-8" /> },
    {
      href: "/direct-loot",
      label: "Direct",
      icon: <Users2 className="w-8 h-8" />,
    },
    {
      href: "/indirect-loot",
      label: "Indirect",
      icon: <Group className="w-8 h-8" />,
    },
  ];

  const handleNavigation = (url: string) => {
    if (pathname !== url) {
      setIsLoading(true);
      router.push(url);
    }
  };

  //   const handleSignOut = async () => {
  //     try {
  //       setIsLoading(true);
  //       await supabase.auth.signOut();
  //       router.refresh();
  //     } catch (e) {
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-800 shadow-md md:hidden">
      {isLoading && <NavigationLoader visible={isLoading} />}
      <ul className="flex justify-around py-2">
        {navItems.map((item) => (
          <li key={item.href}>
            <Button
              onClick={() => handleNavigation(item.href)}
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
  );
};

export default MobileNavBar;
