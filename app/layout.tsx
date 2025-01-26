import RouterTransition from "@/components/ui/routerTransition";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Roboto_Slab } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
export const metadata: Metadata = {
  title: "PR1MEPH",
  description: "PR1MEPH",
};

const roboto = Roboto_Slab({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={roboto.className}>
      <body>
        <main>
          <RouterTransition />
          <Suspense fallback={<RouterTransition />}>{children}</Suspense>
        </main>
        <Toaster />
      </body>
    </html>
  );
}
