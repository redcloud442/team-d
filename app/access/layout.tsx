import Head from "next/head";
import Image from "next/image";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-screen h-full flex items-center justify-center sm:p-0 p-4">
      <Head>
        <link
          rel="preload"
          as="image"
          href="/assets/bg/xeloraBg.webp"
          imageSrcSet="/assets/bg/xeloraBg.webp"
          imageSizes="100vw"
        />
      </Head>
      <Image
        src="/assets/bg/xeloraBg.webp"
        alt="Xelora Background"
        width={1980}
        height={1080}
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      />
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-40 z-10" />

      {children}
    </section>
  );
}
