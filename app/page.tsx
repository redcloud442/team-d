import LandingPage from "@/components/LandingPage/LandingPage";
import { createClientServerSide } from "@/utils/supabase/server";
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
  weight: ["400", "700", "900"],
});

const Page = async () => {
  const supabase = await createClientServerSide();
  const user = await supabase.auth.getUser();

  return (
    <div className={montserrat.className}>
      <LandingPage user={user.data.user} />
    </div>
  );
};

export default Page;
