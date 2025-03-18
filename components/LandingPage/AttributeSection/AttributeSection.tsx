"use client";

import CustomChevron from "@/components/ui/customChevron";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

const HowToEarnSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <div
      ref={sectionRef}
      id="how-to-earn"
      className="relative flex flex-col-reverse lg:flex-row items-center gap-10 lg:gap-48 justify-end w-full h-auto text-white"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/landing/background.jpg"
          alt="Background"
          width={1920}
          height={1080}
          quality={80}
          className="object-cover w-full h-full rotate-180"
          priority
        />
      </div>

      {/* Left Content Section */}
      <motion.div
        initial={{ opacity: 0, x: 0 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 1.3 }}
        className="relative z-30 flex-initial flex flex-col w-full max-w-lg text-justify text-lg lg:text-xl px-10"
      >
        <h2 className="text-4xl xl:text-start text-center xl:text-5xl font-extrabold text-amber-400 tracking-wide">
          HOW TO EARN
        </h2>
        <p className="text-gray-300 mt-4 leading-relaxed indent-10">
          The minimum investment is{" "}
          <span className="font-bold text-amber-400">200 PHP</span>. After
          making your deposit, you will select your package terms from the
          following list.
        </p>

        {/* Investment Plans */}
        <div className="space-y-4 mt-4">
          <p className="text-gray-300 leading-relaxed">
            <span className="text-amber-400 font-bold">Pioneer Plan:</span> You
            can earn <span className="font-bold text-amber-500">4.28%</span>{" "}
            daily earnings or{" "}
            <span className="font-bold text-amber-500">30%</span> in{" "}
            <span className="font-bold text-amber-500">7 Days</span>.
          </p>
          <p className="text-gray-300 leading-relaxed">
            <span className="text-amber-400 font-bold">Prime Plan:</span> You
            can earn <span className="font-bold text-amber-500">5%</span> daily
            earnings or <span className="font-bold text-amber-500">70%</span> in{" "}
            <span className="font-bold text-amber-500">14 Days</span>.
          </p>
        </div>

        <h2 className="text-2xl lg:text-4xl font-extrabold text-amber-400 mt-6 tracking-widest">
          DAILY WITHDRAW
        </h2>

        {/* Sign In Button */}

        <CustomChevron
          direction="left"
          className="absolute -bottom-20 right-0 text-amber-400"
        />
        <CustomChevron
          direction="right"
          className="absolute -top-20 left-0 text-amber-400"
        />
      </motion.div>

      {/* Right Video Section with Yellow Background */}
      <motion.div
        initial={{ opacity: 0, x: 0 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 1.3 }}
        className="flex-initial flex justify-center items-center w-[55%] mt-8 lg:mt-0 z-30"
      >
        <div className="absolute -z-10 bg-amber-400 w-full lg:w-[55%] h-[32vh] lg:h-[30vh] right-0"></div>

        {/* Video */}
        <video
          src="/assets/pr1me_crypto_service.mp4"
          autoPlay
          muted
          controls
          loop
          className="w-full lg:w-[50%] h-[50vh] max-h-[50vh] object-contain"
        />
      </motion.div>
    </div>
  );
};

export default HowToEarnSection;
