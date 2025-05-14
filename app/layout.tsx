import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xelora",
  description: "Step into Xelora — Your path to digital prosperity.",
  openGraph: {
    title: "Xelora",
    description: "Step into Xelora — Your path to digital prosperity.",
    url: "https://xelora.io",
    siteName: "Xelora",
    images: [
      {
        url: "https://xelora.io/assets/icons/logo.ico",
        width: 1200,
        height: 630,
        alt: "Xelora Banner",
      },
    ],
    type: "website",
  },
};

const roboto = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
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
          {/* <RouterTransition /> */}
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
