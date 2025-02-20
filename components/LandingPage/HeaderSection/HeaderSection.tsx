import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";

const HeaderSection = () => {
  return (
    <div
      className={`relative w-full min-h-screen gap-y-10 lg:gap-y-0 flex flex-col `}
    >
      <div className="hidden lg:absolute top-42 left-0 md:left-0 md:px-10 z-40 w-full">
        <Image
          src="/landing/arrow.png"
          alt="arrow"
          width={1920}
          height={1080}
          quality={80}
          priority
          className="object-cover w-full h-full"
        />
      </div>
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

      <nav className="z-30 hidden md:flex flex-col md:flex-row items-start px-8 py-4 bg-amber-500 m-10">
        <h1 className="text-2xl font-bold w-full max-w-sm  text-black">
          PRIME
        </h1>

        <div className="flex space-x-6 flex-1 justify-evenly text-black font-bold">
          <Link href="/" className="hover:text-gray-200">
            Home
          </Link>
          <Link href="#" className="hover:text-gray-200">
            About
          </Link>
          <Link href="#" className="hover:text-gray-200">
            Plans
          </Link>
          <Link href="#" className="hover:text-gray-200">
            Contact
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-30 flex flex-col lg:flex-row items-center lg:items-start justify-between px-12 lg:px-24 mt-12 lg:mt-24">
        {/* Text Section */}
        <div className="w-full lg:max-w-4xl text-center lg:text-start text-white font-extrabold leading-normal">
          <h1 className="text-5xl lg:text-[3.5rem] xl:text-[5.5rem]">
            THE{" "}
            <span className="bg-amber-400 text-white px-2 inline-block">
              BEST
            </span>{" "}
            <br />
            CRYPTO TRADING SERVICES
          </h1>
        </div>

        {/* Founder Image */}
        <div className="hidden lg:block">
          <Image
            src="/landing/founder.png"
            alt="Founder"
            width={400}
            height={1000}
            quality={100}
            className="rounded-lg drop-shadow-xl object-contain shadow-white "
          />
        </div>

        <div className="relative lg:hidden">
          <Image
            src="/app-logo.png"
            alt="Logo"
            width={300}
            height={300}
            quality={100}
            className="rounded-lg drop-shadow-xl shadow-white "
          />
        </div>
        <div className=" flex justify-center items-center  lg:hidden w-full">
          <Button className="bg-white rounded-sm h-12 text-black text-xl font-bold cursor-pointer">
            SIGN IN
          </Button>
        </div>

        <div className=" hidden md:absolute top-1/3 mt-22 md:mt-0 right-1/2 left-1/2 z-50">
          <Button className="bg-white rounded-sm h-12 text-black text-xl font-bold cursor-pointer">
            SIGN IN
          </Button>
        </div>

        <div className="relative xl:absolute pb-10 md:pb-10 lg:pb-0 lg:absolute bottom-[10%] left-1/2 transform -translate-x-1/2 translate-y-1/2 w-full z-30 flex flex-col items-center lg:bottom-[20%] xl:bottom-[30%]">
          <div className="flex flex-col">
            <h1 className="lg:block hidden text-xl lg:text-[2.4rem] xl:text-[4.2rem] font-medium text-white text-center lg:text-start">
              THE
            </h1>
            <h1 className="text-5xl lg:text-[8rem] xl:text-[14rem] font-extrabold text-white tracking-widest text-center lg:text-start">
              FOUNDER
            </h1>
            <h1 className="text-md  lg:text-[2.4rem] xl:text-[4.2rem] font-medium text-white tracking-widest">
              DANNIELE JOSHUA VALDENIBRO
            </h1>
          </div>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="z-30 h-full min-h-80 bg-amber-400 py-8 px-8 lg:px-24 flex flex-col md:flex-row justify-around items-center text-black">
        {/* Mission */}
        <div className="w-full max-w-sm text-center">
          <h3 className="text-2xl lg:text-4xl font-extrabold text-center">
            MISSION
          </h3>
          <p className="font-semibold text-gray-900 text-lg md:text-xl">
            Helping everyone learn about <strong>Cryptocurrency trading</strong>
            , to earn passive income, and build a successful business to achieve
            their goals & success.
          </p>
        </div>

        {/* Separator (Horizontal on small screens, Vertical on md and above) */}
        <div className="flex items-center">
          <Separator className="hidden md:block w-[2px] h-32 bg-black" />
          <Separator className="block md:hidden w-80 h-[2px] bg-black my-4" />
        </div>

        {/* Vision */}
        <div className="w-full max-w-sm text-center">
          <h3 className="text-2xl lg:text-4xl font-extrabold text-center">
            VISION
          </h3>
          <p className="font-semibold text-gray-900 text-lg md:text-xl">
            Prime Company will be known and inspire everyone to achieve their
            goals, creating a history for future decades in the world of{" "}
            <strong>Cryptocurrency</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeaderSection;
