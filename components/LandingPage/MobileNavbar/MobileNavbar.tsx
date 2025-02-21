import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sidebar } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
const MobileNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className=" fixed top-10 left-0 md:hidden z-50 bg-transparent text-amber-400">
          <Sidebar />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="bg-amber-400 rounded-t-3xl  text-white"
      >
        <SheetHeader>
          <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col justify-center items-center relative gap-4 mt-6 text-center">
          <Link
            onClick={() => setIsOpen(false)}
            href="/"
            className="text-lg font-medium hover:text-amber-400"
          >
            Home
          </Link>
          <Link
            onClick={() => setIsOpen(false)}
            href="#about"
            className="text-lg font-medium hover:text-amber-400"
          >
            About
          </Link>
          <Link
            onClick={() => setIsOpen(false)}
            href="#plans"
            className="text-lg font-medium hover:text-amber-400"
          >
            Plans
          </Link>
          <Link
            onClick={() => setIsOpen(false)}
            href="#faqs"
            className="text-lg font-medium hover:text-amber-400"
          >
            FAQs
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavbar;
