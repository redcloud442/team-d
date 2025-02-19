import LandingPage from "@/components/LandingPage/LandingPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pr1me Pinas",
  description: "Pr1me Pinas",
  openGraph: {
    url: "/",
  },
};

const Page = async () => {
  return <LandingPage />;
};

export default Page;
