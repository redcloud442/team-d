import LoginPage from "@/components/loginPage/loginPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Xelora Access Login",
  description: "Log in to your Xelora account and manage your journey.",
  openGraph: {
    url: "https://xelora.io/access/login",
    title: "Xelora | Access Your Account",
    description: "Log in to your Xelora account and manage your journey.",
    siteName: "Xelora",
    images: [
      {
        url: "https://xelora.io/assets/icons/logo.ico", // ✅ Replace with your actual hosted banner
        width: 1200,
        height: 630,
        alt: "Xelora Login Page",
      },
    ],
    type: "website",
  },
};
const Page = async () => {
  return <LoginPage />;
};
export default Page;
