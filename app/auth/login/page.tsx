import LoginPage from "@/components/loginPage/loginPage";
import { protectionRegisteredUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Pr1me Login | Access Your Account",
  description: "Pr1me ang sagot!",
  openGraph: {
    url: "/auth/login",
    title: "Pr1me Login | Access Your Account",
    description: "Pr1me ang sagot!",
    siteName: "primepinas.com",
    images: [
      {
        url: "/app-logo.png",
        width: 1200,
        height: 630,
        alt: "Pr1me Login Page",
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
    <main className="max-w-full min-h-screen flex flex-col items-center justify-center bg-pageColor">
      <LoginPage />
    </main>
  );
};
export default Page;
