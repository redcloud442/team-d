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
      icon: <Coins size={24} />,
    },
    {
      label: "Packages",
      href: "/packages",
      icon: <Package size={24} />,
    },
    {
      label: "History",
      href: "/top-up/history",
      icon: <History size={24} />,
    },
    {
      label: "Withdraw",
      href: "/withdraw",
      icon: <Banknote size={24} />,
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
    <>
      <NavigationLoader visible={isLoading} />
      {/* Floating Bottom Navigation for Small Screens */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg flex justify-around p-2 md:hidden">
        {dashboardRoutes.map((route, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={() => handleNavigation(route.href)}
            className="flex flex-col items-center justify-center"
          >
            {route.icon}
            <span className="text-xs font-medium">{route.label}</span>
          </Button>
        ))}
      </div>

      {/* Grid Layout for Larger Screens */}
      <div className="hidden md:flex justify-center py-8 px-4">
        <div className="flex flex-wrap justify-center md:justify-between w-full max-w-5xl gap-4">
          {dashboardRoutes.map((route, index) => (
            <Button
              key={index}
              size="lg"
              variant="default"
              onClick={() => handleNavigation(route.href)}
              className="flex flex-col items-center justify-center h-24 w-24 p-4"
            >
              {route.icon}
              <span className="mt-2 text-sm font-medium">{route.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </>
  );
};

export default LayoutButton;
