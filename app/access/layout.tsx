import Image from "next/image";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-screen h-full flex items-center justify-center sm:p-0 p-4">
      <Image
        src="/assets/bg/xeloraBg.webp"
        alt="Xelora Background"
        width={1980}
        height={1080}
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        priority
      />

      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-40 z-10" />

      {children}
    </section>
  );
}
