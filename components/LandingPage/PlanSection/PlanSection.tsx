import Image from "next/image";

const HowToEarnAndPlanSection = () => {
  return (
    <div className="relative flex flex-col items-center w-full min-h-screen text-white">
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

      <div className="relative flex flex-col space-y-6 w-full items-center z-30 mt-20">
        <h1 className="text-5xl font-extrabold text-amber-500 tracking-wide">
          THE PR1ME PLANS
        </h1>
        <div className="flex flex-col md:flex-row items-center justify-between px-10 max-w-7xl w-full">
          <Image
            src="/assets/7days-pioneer-plan.png"
            alt="Plan 1"
            width={500}
            height={500}
            className="object-contain"
          />
          <Image
            src="/assets/14d-prime-plan.png"
            alt="Plan 2"
            width={500}
            height={500}
            className="object-contain"
          />
        </div>
        <div className="flex flex-col items-center justify-center max-w-5xl bg-amber-400 w-full ">
          <h1 className="text-5xl font-extrabold text-green-600 tracking-widest italic">
            {"100 % MONEY BACK GUARANTEE".split("").map((letter, index) => (
              <span key={index} className="text-shadow-white">
                {letter}
              </span>
            ))}
          </h1>
          <p className="text-white text-3xl italic font-bold tracking-widest">
            &quot;DITO SA PR1ME DAILY ANG WITHDRAWAL&quot;
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowToEarnAndPlanSection;
