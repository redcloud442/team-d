import Image from "next/image";
import Link from "next/link";

// app/not-found.tsx
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4 bg-amber-950">
      <Image
        src="/assets/icons/logo.ico"
        alt="Not Found"
        width={150}
        height={150}
        priority
        className="mb-6"
      />
      <h1 className="text-4xl font-bold text-white">404 - Page Not Found</h1>
      <p className="mt-4 text-gray-300">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-block px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
      >
        Go back
      </Link>
    </div>
  );
}
