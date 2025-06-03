import QueryClientProvider from "@/components/QueryClientProvider/QueryClientProvider";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "DIGIWEALTH",
  description: "Step into Digi Wealth — Your path to digital prosperity.",
  openGraph: {
    title: "DIGIWEALTH",
    description: "Step into Digi Wealth — Your path to digital prosperity.",
    url: "https://www.digi-wealth.vip",
    siteName: "DIGIWEALTH",
    images: [
      {
        url: "https://www.digi-wealth.vip/assets/icons/iconGif.webp",
        width: 1200,
        height: 630,
        alt: "DIGIWEALTH",
      },
    ],
    type: "website",
  },
};

const roboto = Roboto({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700"],
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
          <QueryClientProvider>{children}</QueryClientProvider>
        </main>
        <Toaster />
      </body>
    </html>
  );
}
