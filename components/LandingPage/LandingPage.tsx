import { User } from "@supabase/supabase-js";
import AboutSection from "./AboutSection/AboutSection";
import AttributeSection from "./AttributeSection/AttributeSection";
import FooterSection from "./FooterSection/FooterSection";
import HeaderSection from "./HeaderSection/HeaderSection";
import PlanSection from "./PlanSection/PlanSection";
import SlideSection from "./SlideSection/SlideSection";

type LandingPageProps = {
  user: User | null;
};

const LandingPage = ({ user }: LandingPageProps) => {
  return (
    <>
      <HeaderSection user={user} />
      <AboutSection />
      <AttributeSection />
      <PlanSection />
      <SlideSection />
      <FooterSection />
    </>
  );
};

export default LandingPage;
