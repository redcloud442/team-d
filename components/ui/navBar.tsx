import Link from "next/link";

const NavBar = () => {
  return (
    <nav className="w-full bg-gray-800 text-white shadow-lg">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-end items-center h-16">
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/profile" className="hover:underline mx-4">
            Profile
          </Link>
          <Link href="/settings" className="hover:underline">
            Settings
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
