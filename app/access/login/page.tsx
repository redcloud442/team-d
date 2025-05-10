import LoginPage from "@/components/loginPage/loginPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Xeloria Access Login",
  description: "Log in to your Xeloria account and manage your journey.",
  openGraph: {
    url: "https://xeloria.io/access/login",
    title: "Xeloria | Access Your Account",
    description: "Log in to your Xeloria account and manage your journey.",
    siteName: "Xeloria",
    images: [
      {
        url: "https://xeloria.io/assets/icons/logo.ico", // ✅ Replace with your actual hosted banner
        width: 1200,
        height: 630,
        alt: "Xeloria Login Page",
      },
    ],
    type: "website",
  },
};
const Page = async () => {
  return <LoginPage />;
};
export default Page;
