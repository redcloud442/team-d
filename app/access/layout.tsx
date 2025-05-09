import Image from "next/image";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="dark:bg-pageColor bg-pageColor">
      <div className="fixed -top-12 z-10">
        <Image
          src="/assets/lightning.svg"
          alt="thunder"
          width={300}
          height={300}
          quality={100}
          className="w-full sm:hidden"
          priority
        />
      </div>

      <div className="absolute top-[10%] sm:top-[10%] flex items-center justify-center w-full">
        <Image
          src="/app-logo.svg"
          alt="logo"
          width={120}
          height={120}
          priority
        />
      </div>
      {children}
    </main>
  );
}
