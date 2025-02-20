"use client";

import AboutSection from "./AboutSection/AboutSection";
import AttributeSection from "./AttributeSection/AttributeSection";
import FooterSection from "./FooterSection/FooterSection";
import HeaderSection from "./HeaderSection/HeaderSection";
import PlanSection from "./PlanSection/PlanSection";
import SlideSection from "./SlideSection/SlideSection";

const LandingPage = () => {
  return (
    <>
      <HeaderSection />
      <AboutSection />
      <AttributeSection />
      <PlanSection />
      <SlideSection />
      <FooterSection />
    </>
  );
};

export default LandingPage;
