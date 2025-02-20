import LandingPage from "@/components/LandingPage/LandingPage";
import { Metadata } from "next";
import { Montserrat } from "next/font/google";

export const metadata: Metadata = {
  title: "Pr1me Pinas",
  description: "Pr1me Pinas",
  openGraph: {
    url: "/",
  },
};
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700", "900"], // Adjust weights as needed
});

const Page = async () => {
  return (
    <div className={montserrat.className}>
      <LandingPage />
    </div>
  );
};

export default Page;
