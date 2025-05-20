import DigiAuth from "@/components/DigiAuth/DigiAuthPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in your account",
  description: "Sign in an account",
  openGraph: {
    url: "https://www.digi-wealth.vip/access/xeloraAccess",
  },
};

const Page = async () => {
  return <DigiAuth />;
};
export default Page;
