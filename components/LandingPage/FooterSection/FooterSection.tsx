import { Facebook, Youtube } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const FooterSection = () => {
  return (
    <footer className="text-white py-10 bg-black">
      <div className="container mx-auto px-6 lg:px-16 z-50">
        {/* Footer Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2  lg:place-items-center gap-10 ">
          {/* Left Section: Logo & About */}
          <div className="flex flex-col items-center lg:items-start space-y-4 z-50">
            {/* Logo */}
            <div className="flex lg:justify-start justify-center items-center space-x-3">
              <Image
                src="/app-logo.png" // Replace with your actual logo path
                alt="Company Logo"
                width={50}
                height={50}
                className="object-contain"
              />
              Pr1me Pinas
            </div>
            <p className="text-gray-400 max-w-md lg:text-start text-center">
              We provide the best investment solutions with high returns.
              Secure, reliable, and trusted by thousands of users worldwide.
            </p>

            {/* Social Media Links */}
            <div className="flex lg:justify-start justify-center space-x-5 mt-2 cursor-pointer">
              <Link
                href="https://www.facebook.com/groups/pr1meofficialgroup"
                target="_blank"
              >
                <Facebook />
              </Link>
              <Link href="https://www.youtube.com/@Pr1mepinas" target="_blank">
                <Youtube />
              </Link>
            </div>
          </div>

          {/* Right Section: Navigation */}
          <div className="grid grid-cols-1 lg:grid-cols-2  text-center md:text-start gap-6 z-50 ">
            <div>
              <h3 className="text-lg font-semibold text-amber-500 mb-3">
                Company
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#about"
                    className="text-gray-400 hover:text-amber-500 transition"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#how-to-earn"
                    className="text-gray-400 hover:text-amber-500 transition"
                  >
                    How to Earn
                  </Link>
                </li>
                <li>
                  <Link
                    href="#plans"
                    className="text-gray-400 hover:text-amber-500 transition"
                  >
                    Plans
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-10 border-t border-gray-700 pt-6 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Pr1me Pinas. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
