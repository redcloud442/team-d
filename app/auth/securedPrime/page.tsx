import Pr1meSecured from "@/components/pr1meSecured/pr1meSecured";
import { protectionRegisteredUser } from "@/utils/serversideProtection";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Log in your account",
  description: "Sign in an account",
  openGraph: {
    url: "/auth/securedPrime",
  },
};

const Page = async () => {
  const result = await protectionRegisteredUser();

  if (result?.redirect) {
    redirect("/");
  }

  return (
    <main className="max-w-full min-h-screen flex flex-col items-center justify-center bg-pageColor">
      <Pr1meSecured />
    </main>
  );
};
export default Page;
