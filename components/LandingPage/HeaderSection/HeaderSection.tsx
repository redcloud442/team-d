import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Montserrat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700", "900"], // Adjust weights as needed
});

const HeaderSection = () => {
  return (
    <div
      className={`relative w-full min-h-screen flex flex-col ${montserrat.className}`}
    >
      <div className="absolute top-42 left-10 z-10">
        <Image
          src="/landing/arrow.png"
          alt="arrow"
          width={1920}
          height={1080}
          priority
        />
      </div>
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
        <div className="fixed inset-0 z-20 flex bg-black/10 flex-col items-center"></div>
      </div>

      <nav className="relative z-30 flex items-center px-8 py-4 bg-amber-500 m-10">
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
      <div className="relative z-10 flex flex-col lg:flex-row items-start justify-between px-12 lg:px-24 mt-12 lg:mt-24">
        {/* Text Section */}
        <div className="max-w-4xl text-white font-extrabold leading-normal">
          <h1 className="text-6xl lg:text-[5.5rem]">
            THE{" "}
            <span className="bg-amber-400 text-white px-2 inline-block">
              BEST
            </span>{" "}
            <br />
            CRYPTO TRADING SERVICES
          </h1>
        </div>

        {/* Founder Image */}
        <div className="relative">
          <Image
            src="/landing/founder.png"
            alt="Founder"
            width={400}
            height={1000}
            className="rounded-lg drop-shadow-xl shadow-white "
          />
        </div>
      </div>

      <div className="absolute top-1/3 mt-22 right-1/2 left-1/2 z-50">
        <Button className="bg-white rounded-sm h-12 text-black text-xl font-bold cursor-pointer">
          SIGN IN
        </Button>
      </div>

      <div className="absolute bottom-1/8 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full mx-auto z-30 flex flex-col items-center">
        <div className="flex flex-col">
          <h1 className="text-4xl lg:text-[3.8rem] font-medium text-white">
            THE
          </h1>
          <h1 className="text-6xl lg:text-[14rem] font-extrabold text-white tracking-widest">
            FOUNDER
          </h1>
          <h1 className="text-2xl lg:text-[4.2rem] font-medium text-white tracking-widest">
            DANNIELE JOSHUA VALDENIBRO
          </h1>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="z-30 h-full min-h-80 bg-amber-400 py-8 px-8 lg:px-24 flex justify-around items-center  text-black">
        {/* Mission */}
        <div className="w-full max-w-sm text-center">
          <h3 className="text-3xl font-extrabold text-center">MISSION</h3>
          <p className="font-semibold text-gray-900 text-xl">
            Helping everyone learn about <strong>Cryptocurrency trading</strong>
            , to earn passive income, and build a successful business to achieve
            their goals & success.
          </p>
        </div>

        <div className="flex items-center">
          <Separator orientation="vertical" className="w-[2px] h-32" />
        </div>

        {/* Vision */}
        <div className="w-full max-w-sm text-center">
          <h3 className="text-3xl font-extrabold text-center">VISION</h3>
          <p className="font-semibold text-gray-900 text-xl">
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
