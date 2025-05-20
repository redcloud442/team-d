import LoginPage from "@/components/loginPage/loginPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "DIGIWEALTH LOGIN",
  description: "Log in to your Digi Wealth account and manage your journey.",
  openGraph: {
    url: "https://www.digi-wealth.vip/login",
    title: "DIGIWEALTH LOGIN",
    description: "Log in to your Digi Wealth account and manage your journey.",
    siteName: "DIGIWEALTH",
    images: [
      {
        url: "https://www.digi-wealth.vip/assets/icons/iconGif.webp", // ✅ Replace with your actual hosted banner
        width: 1200,
        height: 630,
        alt: "DIGIWEALTH LOGIN",
      },
    ],
    type: "website",
  },
};
const Page = async () => {
  return <LoginPage />;
};
export default Page;
