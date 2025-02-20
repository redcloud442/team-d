import { Button } from "@/components/ui/button";
import Image from "next/image";

const AboutSection = () => {
  return (
    <div
      className={`relative flex xl:flex-row flex-col xl:gap-y-0 gap-y-10 justify-around px-16 items-center w-full min-h-screen  text-white`}
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
      <div className="relative z-30">
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
      </div>

      {/* Right Side: About Section */}
      <div className="flex-1 flex flex-col w-full max-w-lg z-30 text-justify text-xl">
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
        <Button className="mt-6 w-full xl:w-1/2 h-12 rounded-sm px-6 py-3 bg-amber-500 text-black font-bold shadow-lg hover:bg-amber-600 transition">
          SIGN IN
        </Button>
      </div>

      {/* Decorative Bars (Three Lines on Left & Right) */}
      <div className="absolute left-0 top-0 xl:top-1/6 flex flex-col space-y-4 z-40">
        <div className="w-24 h-2 bg-amber-500"></div>
        <div className="w-24 h-2 bg-amber-500"></div>
        <div className="w-24 h-2 bg-amber-500"></div>
      </div>

      <div className="absolute right-0 bottom-0 xl:bottom-1/6 flex flex-col space-y-4 z-40">
        <div className="w-24 h-2 bg-amber-500"></div>
        <div className="w-24 h-2 bg-amber-500"></div>
        <div className="w-24 h-2 bg-amber-500"></div>
      </div>
    </div>
  );
};

export default AboutSection;
