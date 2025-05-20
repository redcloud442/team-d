import Link from "next/link";

// app/not-found.tsx
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4 bg-bg-primary">
      <h1 className="text-4xl font-bold text-white">404 - Page Not Found</h1>
      <p className="mt-4 text-gray-300">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/digi-dash"
        className="mt-6 inline-block px-4 py-2 bg-bg-primary-blue text-black rounded hover:bg-bg-primary-blue/80 transition"
      >
        Go back
      </Link>
    </div>
  );
}
