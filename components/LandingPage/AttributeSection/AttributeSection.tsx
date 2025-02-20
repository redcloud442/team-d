import { Button } from "@/components/ui/button";
import Image from "next/image";

const HowToEarnSection = () => {
  return (
    <div className="relative flex flex-row-reverse gap-x-40 items-center w-full min-h-screen text-white">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/landing/background.jpg"
          alt="Background"
          width={1920}
          height={1080}
          quality={80}
          className="object-cover w-full h-full"
          priority
        />
      </div>
      {/* Left Side: Video Section */}
      <div className="z-30 bg-amber-400 w-1/2 h-[30vh]"></div>
      =
      <video
        src="/assets/pr1me_crypto_service.mp4"
        autoPlay
        muted
        controls
        loop
        className="absolute top-[50vh] right-2 transform -translate-x-1/2 -translate-y-1/2 w-1/4 h-[50vh] object-contain z-30"
      />
      {/* Right Side: Content */}
      <div className="flex-1 flex flex-col w-full max-w-lg z-30 text-justify text-xl">
        <h2 className="text-5xl font-extrabold text-amber-500 tracking-wide">
          HOW TO EARN
        </h2>
        <p className="text-gray-300 mt-4 leading-relaxed indent-10">
          The minimum investment is 200 PHP. After making your deposit, you will
          select your package terms from the following list.
        </p>
        <p className="text-gray-300 leading-relaxed">
          <span className="text-amber-400 font-bold">Pioneer Plan: </span> You
          can earn <span className="font-bold text-amber-500">2.5%</span> daily
          earnings or <span className="font-bold text-amber-500">30%</span> in{" "}
          <span className="font-bold text-amber-500">7 Days</span>.
        </p>
        <p className="text-gray-300  leading-relaxed">
          <span className="text-amber-400 font-bold">Prime Plan: </span> You can
          earn <span className="font-bold text-amber-500">5.83%</span> daily
          earnings or <span className="font-bold text-amber-500">70%</span> in{" "}
          <span className="font-bold text-amber-500">14 Days</span>.
        </p>
        <h2 className="text-4xl font-extrabold text-amber-400 mt-4 tracking-widest">
          DAILY WITHDRAW
        </h2>
        <Button className="mt-6 w-1/2 h-12 rounded-sm px-6 py-3 bg-amber-500 text-black font-bold shadow-lg hover:bg-amber-600 transition">
          SIGN IN
        </Button>
      </div>
      <div className="absolute right-[75vh] top-[40vh] flex flex-col space-y-4 z-40">
        <div className="w-24 h-2 bg-amber-500"></div>
        <div className="w-24 h-2 bg-amber-500"></div>
        <div className="w-24 h-2 bg-amber-500"></div>
      </div>
    </div>
  );
};

export default HowToEarnSection;
