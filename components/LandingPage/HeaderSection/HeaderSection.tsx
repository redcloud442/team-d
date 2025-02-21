import { Button } from "@/components/ui/button";
import CustomChevron from "@/components/ui/customChevron";
import { Separator } from "@/components/ui/separator";
import { User } from "@supabase/supabase-js";
import { motion, useInView } from "framer-motion";
import { Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import MobileNavbar from "../MobileNavbar/MobileNavbar";

type HeaderSectionProps = {
  user: User | null;
};

const HeaderSection = ({ user }: HeaderSectionProps) => {
  const router = useRouter();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const handlePushToLogin = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/auth/login");
    }
  };

  return (
    <div className="relative w-full min-h-screen gap-y-10 lg:gap-y-0 flex flex-col xl:pt-20 pt-10">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className="hidden lg:absolute top-42 left-0 md:left-0 md:px-10 z-40 w-full"
      >
        <Image
          src="/landing/arrow.png"
          alt="arrow"
          width={2000}
          height={1080}
          quality={80}
          priority
          className="object-cover w-full h-full"
        />
      </motion.div>

      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/landing/background.jpg"
          alt="Background"
          width={2000}
          height={1080}
          quality={80}
          className=" w-full h-full"
          priority
        />
      </div>

      <MobileNavbar />

      <motion.nav
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-50 hidden md:flex bg-amber-600 m-10 p-4 fixed top-0 left-0 right-0 rounded-sm"
      >
        <Link href="/">
          <Image
            src="/app-logo-w-name.png"
            alt="Logo"
            width={150}
            height={100}
            quality={80}
          />
        </Link>
        <div className="flex space-x-6 flex-1 justify-end gap-x-5 items-center text-white font-bold">
          <Link href="/" className="hover:scale-115 duration-400">
            Home
          </Link>
          <Link href="#about" className="hover:scale-115 duration-400">
            About
          </Link>
          <Link href="#plans" className="hover:scale-115 duration-400">
            Plans
          </Link>
          <Link href="#faqs" className="hover:scale-115 duration-400">
            Faqs
          </Link>
          <a
            href="https://apkfilelinkcreator.cloud/uploads/PrimePinas_v1.1.apk"
            download="PrimePinas_v1.1.apk"
            className="cursor-pointer"
          >
            <Button
              type="button"
              variant="outline"
              className=" h-12 rounded-md bg-background text-white gap-2 cursor-pointer hover:bg-stone-800 hover:text-white"
            >
              <span className="text-sm">Pr1me App</span>
              <Download className="w-4 h-4" />
            </Button>
          </a>
          <Link
            href="/auth/login"
            className="hover:scale-105 duration-400 cursor-pointer"
          >
            <Button className="bg-white text-black rounded-sm h-12 cursor-pointer">
              {user ? "DASHBOARD" : "SIGN IN"}
            </Button>
          </Link>
        </div>
      </motion.nav>

      <CustomChevron
        direction="left"
        className="absolute top-40 right-20 text-white"
      />
      <CustomChevron
        direction="right"
        className="absolute top-40 left-20 text-white"
      />
      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-30 flex flex-col lg:flex-row items-center lg:items-start justify-between px-12 lg:px-24 mt-14 md:mt-44"
      >
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="w-full lg:max-w-4xl text-center lg:text-start text-white font-extrabold leading-normal"
        >
          <h1 className="text-5xl lg:text-[3.5rem] xl:text-[5.5rem]">
            THE{" "}
            <span className="bg-amber-400 text-white px-2 inline-block animate-pulse duration-3000">
              BEST
            </span>{" "}
            <br />
            CRYPTO TRADING SERVICES
          </h1>
        </motion.div>

        {/* Founder Image */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2 }}
          className="relative hidden lg:block "
        >
          <Image
            src="/landing/founder.png"
            alt="Founder"
            width={400}
            height={500}
            quality={100}
            className="rounded-lg drop-shadow-xl object-contain shadow-white z-50"
          />
          <motion.video
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            autoPlay
            muted
            loop
            playsInline
            className="lg:block hidden absolute top-22 -left-26 w-40 lg:w-56 rounded-lg -z-10"
          >
            <source src="/assets/crypto-animation.webm" type="video/webm" />
          </motion.video>

          {/* Attached Video */}
          <motion.video
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            autoPlay
            muted
            loop
            playsInline
            className="lg:block hidden absolute top-0 right-0 w-40 lg:w-56 rounded-lg -z-10"
          >
            <source src="/assets/crypto-animation.webm" type="video/webm" />
          </motion.video>
        </motion.div>

        {/* Mobile Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative lg:hidden"
        >
          <Image
            src="/app-logo.png"
            alt="Logo"
            width={300}
            height={300}
            quality={100}
            className="rounded-lg drop-shadow-xl shadow-white"
          />
        </motion.div>
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute top-0 left-0  object-contain"
        >
          <source src="/assets/crypto-animation.mp4" type="video/mp4" />
        </video>
        {/* Sign In Button for Mobile */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="flex justify-center items-center lg:hidden w-full"
        >
          <Button
            onClick={handlePushToLogin}
            className="bg-white rounded-sm h-12 text-black text-xl font-bold cursor-pointer"
          >
            {user ? "DASHBOARD" : "SIGN IN"}
          </Button>
        </motion.div>

        <div className="relative xl:absolute pb-10 md:pb-10 lg:pb-0 lg:absolute bottom-[10%] left-1/2 transform -translate-x-1/2 translate-y-1/2 w-full z-30 flex flex-col items-center lg:bottom-[20%] xl:bottom-[30%]">
          <div className="flex flex-col">
            <h1 className="[text-shadow:_0_2px_px_#fef3c7] lg:block hidden text-xl lg:text-[2.4rem] xl:text-[4.2rem] font-medium text-white text-center lg:text-start">
              THE
            </h1>
            <h1 className="[text-shadow:_0_2px_2px_#fef3c7] text-5xl lg:text-[8rem] xl:text-[14rem] font-extrabold text-white tracking-widest text-center lg:text-start">
              FOUNDER
            </h1>
            <h1 className="[text-shadow:_0_2px_2px_#fef3c7]  text-md text-center xl:text-start lg:text-[2.4rem] xl:text-[4.2rem] font-medium text-white tracking-widest">
              DANNIELE JOSHUA VALDENIBRO
            </h1>
          </div>
        </div>
      </motion.div>

      {/* Mission & Vision Section */}
      <motion.div
        ref={sectionRef}
        initial={{ opacity: 0, y: 0 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1.2 }}
        className="z-30 h-full min-h-80 bg-amber-400 py-8 px-8 lg:px-24 flex flex-col md:flex-row justify-around items-center text-black"
      >
        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1.3 }}
          className="w-full max-w-sm text-center"
        >
          <h3 className="text-2xl lg:text-4xl font-extrabold text-center">
            MISSION
          </h3>
          <p className="font-semibold text-gray-900 text-lg md:text-xl">
            Helping everyone learn about <strong>Cryptocurrency trading</strong>
            , to earn passive income, and build a successful business to achieve
            their goals & success.
          </p>
        </motion.div>

        {/* Separator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.2 }}
          className="flex items-center"
        >
          <Separator className="hidden md:block w-[2px] h-32 bg-black" />
          <Separator className="block md:hidden w-80 h-[2px] bg-black my-4" />
        </motion.div>

        {/* Vision */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1.3 }}
          className="w-full max-w-sm text-center"
        >
          <h3 className="text-2xl lg:text-4xl font-extrabold text-center">
            VISION
          </h3>
          <p className="font-semibold text-gray-900 text-lg md:text-xl">
            Prime Company will be known and inspire everyone to achieve their
            goals, creating a history for future decades in the world of{" "}
            <strong>Cryptocurrency</strong>.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HeaderSection;
