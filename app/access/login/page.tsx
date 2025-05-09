import LoginPage from "@/components/loginPage/loginPage";
import { protectionRegisteredUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Starter Next | Access Your Account",
  description: "Starter Next",
  openGraph: {
    url: "/auth/login",
    title: "Starter Next | Access Your Account",
    description: "Starter Next",
    siteName: "starternext.com",
    images: [
      {
        url: "/app-logo.png",
        width: 1200,
        height: 630,
        alt: "Starter Next Login Page",
      },
    ],
    type: "website",
  },
};

const Page = async () => {
  const result = await protectionRegisteredUser();

  if (result?.redirect) {
    redirect("/");
  }

  return (
    <div className="max-w-full min-h-screen flex flex-col items-center justify-center">
      <LoginPage />
    </div>
  );
};
export default Page;
