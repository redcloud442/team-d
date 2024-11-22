"use client";
import { Banknote, Coins, History, Package } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./button";
import NavigationLoader from "./NavigationLoader";

const LayoutButton = () => {
  const dashboardRoutes = [
    {
      label: "Top Up",
      href: "/top-up",
      icon: <Coins />,
    },
    {
      label: "Packages",
      href: "/packages",
      icon: <Package />,
    },
    {
      label: "Top Up History",
      href: "/top-up/history",
      icon: <History />,
    },
    {
      label: "Withdraw",
      href: "/withdraw",
      icon: <Banknote />,
    },
  ];

  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false); // Stop loading when pathname changes
  }, [pathname]);

  const handleNavigation = (href: string) => {
    if (pathname !== href) {
      setIsLoading(true);
      router.push(href);
    }
  };

  return (
    <div className="flex justify-center py-8 px-4">
      <NavigationLoader visible={isLoading} />
      <div className="flex flex-wrap justify-center md:justify-between w-full max-w-5xl gap-4">
        {dashboardRoutes.map((route, index) => (
          <Button
            key={index}
            size="lg"
            onClick={() => handleNavigation(route.href)}
            className="flex items-center justify-center w-full sm:w-auto px-4 py-2"
          >
            {route.icon}
            <span className="ml-2">{route.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default LayoutButton;
