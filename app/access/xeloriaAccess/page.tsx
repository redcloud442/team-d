import Pr1meSecured from "@/components/pr1meSecured/pr1meSecured";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in your account",
  description: "Sign in an account",
  openGraph: {
    url: "/access/xeloriaAccess",
  },
};

const Page = async () => {
  return <Pr1meSecured />;
};
export default Page;
