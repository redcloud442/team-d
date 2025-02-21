"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import CustomChevron from "@/components/ui/customChevron";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

const slides = [
  {
    image: "/faq/how-does-business-profit-2.png",
    title: "HOW DOES THE BUSINESS PROFITS?",
    description: `Our business plan is to make <strong>150%</strong> profit every 2 weeks from the whole cryptocurrency portfolio. Investors get <strong>100%</strong> every 14 days, ensuring our long-term success with <strong>50%</strong> profit coming back to our company. The Pr1me Founder, who is highly educated and experienced in effective risk-reward ratio and risk management, achieves a <strong>98%</strong> success rate. We&apos;re confident that our business can withstand any market situation.
`,
  },
  {
    image: "/faq/how-does-business-profit.png",
    title: "HOW DOES THE BUSINESS PROFITS?",
    description: `Our business plan is to make <strong>150%</strong> profit every 2 weeks from the whole cryptocurrency portfolio. Investors get <strong>100%</strong> every 14 days, ensuring our long-term success with <strong>50%</strong> profit coming back to our company. The Pr1me Founder, who is highly educated and experienced in effective risk-reward ratio and risk management, achieves a <strong>98%</strong> success rate. We&apos;re confident that our business can withstand any market situation.
`,
  },
  {
    image: "/faq/what-is-the-minimum.png",
    title: "WHAT'S THE MINIMUM OR MAXIMUM TO START INVESTING?",
    description: `At <strong>Pr1me</strong>, you can start to invest and
Have earning <strong>passive income</strong> for affordable minimum amount of <strong>200 PHP</strong>.
And There&apos;s <strong>no maximum amount of investment.</strong>`,
  },
  {
    image: "/faq/what-process.png",
    title: "WHAT IS THE PROCESS YOU TAKE TO CASH OUT?",
    description: `Your chosen Pr1me Plan determines the completion schedule for your investment, and requests for withdrawals are processed daily.`,
  },
];

const SlideSection = () => {
  const plugin = useRef(Autoplay({ delay: 10000, stopOnInteraction: true }));

  return (
    <div
      id="faqs"
      className="relative flex justify-center items-end w-full h-auto lg:min-h-screen text-white"
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

      {/* Carousel */}
      <div className="relative z-30 w-full">
        <Carousel plugins={[plugin.current]}>
          <CarouselContent className="border-none">
            {slides.map((slide, index) => (
              <CarouselItem key={index}>
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: index * 0.5 }}
                  className="flex flex-col lg:flex-row items-center justify-around gap-10 h-auto"
                >
                  {/* Left: Image (Fixed Size) */}
                  <div className="relative flex items-center justify-center bg-transparent">
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      height={1000}
                      width={1000}
                      quality={80}
                      className="object-cover lg:block hidden  lg:h-[1100px] w-auto drop-shadow-md"
                    />
                  </div>

                  <div className="w-full max-w-3xl flex flex-col justify-center h-auto">
                    <motion.h2
                      initial={{ opacity: 0, y: -30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1 }}
                      className="block lg:absolute top-36 text-3xl lg:text-5xl font-bold text-white px-6 py-4 rounded-md tracking-widest w-full max-w-3xl"
                    >
                      {slide.title}
                    </motion.h2>

                    <div className=" text-white lg:text-black px-10 ">
                      <p
                        className="text-lg  lg:text-3xl text-justify indent-16 tracking-wide"
                        dangerouslySetInnerHTML={{ __html: slide.description }}
                      />
                    </div>
                  </div>
                  <div className="hidden lg:block lg:absolute bottom-0 bg-amber-400 w-full h-[60vh] -z-10">
                    <CustomChevron
                      direction="right"
                      className="absolute bottom-10 right-10 text-black"
                    />
                  </div>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Yellow Background */}
    </div>
  );
};

export default SlideSection;
