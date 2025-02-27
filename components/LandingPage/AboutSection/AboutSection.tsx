"use client";

import CustomChevron from "@/components/ui/customChevron";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

const AboutSection = () => {
  const sectionRef = useRef(null);

  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <div
      ref={sectionRef}
      id="about"
      className="relative flex xl:flex-row flex-col xl:gap-y-0 gap-y-10 justify-around py-4 px-10 items-center w-full min-h-screen text-white"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/landing/background.jpg"
          alt="Background"
          width={1920}
          height={1080}
          className="object-cover w-full h-full"
          priority
        />
        <div className="fixed inset-0 z-20 flex bg-black/40 flex-col items-center"></div>
      </div>

      {/* Left Side: Founder Image & Bar */}
      <motion.div
        initial={{ opacity: 0, x: 0 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 1.3 }}
        className="relative z-30"
      >
        <Image
          src="/landing/the-founder.jpg" // Change to actual image path
          alt="Founder"
          width={500}
          height={500}
          className="object-contain w-full"
          priority
          quality={100}
        />
        <div className="w-full max-w-4xl h-12 bg-amber-400 z-30 shrink-0"></div>
      </motion.div>

      {/* Right Side: About Section */}
      <motion.div
        initial={{ opacity: 0, x: 0 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 1.3 }}
        className="flex-1 relative flex flex-col w-full max-w-lg z-30 text-justify text-xl"
      >
        <h2 className="text-4xl xl:text-start text-center xl:text-5xl font-extrabold text-amber-400 tracking-wide">
          ABOUT
        </h2>
        <p className="text-gray-300 mt-4 leading-relaxed indent-10">
          The Prime Founder, Danniele Joshua Valdenibro, established the Prime
          Company in January 2025. Since then, he has been trading
          Cryptocurrencies.
        </p>
        <p className="text-gray-300 mt-4 leading-relaxed indent-10">
          Through his trading experience and knowledge, he achieved success and
          great abundance. Danniele started this business to share his trading
          expertise and skills, helping others to earn money and end scarcity
          while also improving his skills in trading cryptocurrency.
        </p>

        <CustomChevron
          direction="left"
          className="absolute -bottom-20 right-0 text-white"
        />
        <CustomChevron
          direction="right"
          className="absolute -top-20 left-0 text-white"
        />
      </motion.div>

      {/* Decorative Bars (Three Lines on Left & Right) */}
      <motion.div
        initial={{ opacity: 0, x: 0 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 1.2 }}
        className="absolute left-0 top-20 xl:top-1/6 flex flex-col space-y-2 z-40"
      >
        <div className="w-14 h-2 bg-amber-500"></div>
        <div className="w-14 h-2 bg-amber-500"></div>
        <div className="w-14 h-2 bg-amber-500"></div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 0 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 1.2 }}
        className="absolute right-0 bottom-20 xl:bottom-1/6 flex flex-col space-y-2 z-40"
      >
        <div className="w-14 h-2 bg-amber-500"></div>
        <div className="w-14 h-2 bg-amber-500"></div>
        <div className="w-14 h-2 bg-amber-500"></div>
      </motion.div>
    </div>
  );
};

export default AboutSection;
