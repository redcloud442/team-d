import XeloraAccess from "@/components/XeloraAccess/XeloraAccessPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in your account",
  description: "Sign in an account",
  openGraph: {
    url: "/access/xeloraAccess",
  },
};

const Page = async () => {
  return <XeloraAccess />;
};
export default Page;
