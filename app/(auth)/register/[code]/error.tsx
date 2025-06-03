"use client";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center text-white">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-sm mb-6">{error.message}</p>
      <Button onClick={() => reset()}>Try Again</Button>
    </div>
  );
}
