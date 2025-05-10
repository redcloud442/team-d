import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Lora } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xeloria",
  description: "Step into Xeloria — Your path to digital prosperity.",
  openGraph: {
    title: "Xeloria",
    description: "Step into Xeloria — Your path to digital prosperity.",
    url: "https://xeloria.io",
    siteName: "Xeloria",
    images: [
      {
        url: "https://xeloria.io/assets/icons/logo.ico",
        width: 1200,
        height: 630,
        alt: "Xeloria Banner",
      },
    ],
    type: "website",
  },
};

const roboto = Lora({
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
          {/* <RouterTransition /> */}
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
