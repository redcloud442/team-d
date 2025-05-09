import { User } from "@supabase/supabase-js";

type LandingPageProps = {
  user: User | null;
};

const LandingPage = ({ user }: LandingPageProps) => {
  return (
    <>
      {/* <HeaderSection user={user} />
      <AboutSection />
      <AttributeSection />
      <PlanSection />
      <SlideSection />
      <FooterSection /> */}
    </>
  );
};

export default LandingPage;
