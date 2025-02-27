"use client";

import CustomChevron from "@/components/ui/customChevron";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

const HowToEarnAndPlanSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <div
      ref={sectionRef}
      id="plans"
      className="relative flex flex-col justify-center items-center w-full h-auto  text-white"
    >
      {" "}
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
      </div>
      <CustomChevron
        direction="up"
        className="absolute top-20 left-10 text-amber-400"
      />
      <CustomChevron direction="down" className="absolute top-10 right-10 " />
      {/* Content Section */}
      <div className="relative flex flex-col space-y-6 w-full items-center z-30 mt-20 px-10">
        {/* Title */}

        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
          className="text-4xl xl:text-start text-center xl:text-5xl font-extrabold text-amber-400 tracking-wide"
        >
          THE PR1ME PLANS
        </motion.h1>

        {/* Plan Images */}
        <div className="flex flex-col gap-10 lg:flex-row items-center justify-between px-10 max-w-7xl w-full">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1.2, delay: 0.3 }}
          >
            <Image
              src="/assets/7days-pioneer-plan.png"
              alt="Plan 1"
              width={500}
              height={500}
              className="object-contain"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1.2, delay: 0.6 }}
          >
            <Image
              src="/assets/14d-prime-plan.png"
              alt="Plan 2"
              width={500}
              height={500}
              className="object-contain"
            />
          </motion.div>
        </div>

        {/* Money Back Guarantee */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.8 }}
          className="flex flex-col items-center justify-center max-w-6xl bg-amber-400 w-full p-4 lg:p-6 shadow-lg"
        >
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={isInView ? { scale: 1.1 } : {}}
            transition={{
              duration: 1,
            }}
            className="text-sm text-center lg:text-start lg:text-5xl font-extrabold text-green-600 tracking-widest italic"
          >
            {"100 % MONEY BACK GUARANTEE".split("").map((letter, index) => (
              <span key={index} className="text-shadow-white">
                {letter}
              </span>
            ))}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 1 }}
            className="text-white text-[10px] text-center lg:text-start lg:text-3xl italic font-bold tracking-widest"
          >
            &quot;DITO SA PR1ME DAILY ANG WITHDRAWAL&quot;
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default HowToEarnAndPlanSection;
