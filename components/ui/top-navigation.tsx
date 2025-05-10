import Link from "next/link";
import { Button } from "./button";

const TopNavigation = () => {
  return (
    <nav className="flex relative  justify-between items-center p-2 bg-amber-950">
      <div className="flex justify-between items-center px-4 py-2">
        <Link
          href="/dashboard"
          className="bg-gradient-to-b from-yellow-400 to-orange-500 bg-clip-text text-transparent font-bold text-lg"
        >
          XELORA
        </Link>
      </div>

      <div>
        <Button variant="outline" className="rounded-sm text-xs p-2">
          Contact my sponsor!
        </Button>
      </div>
    </nav>
  );
};

export default TopNavigation;
