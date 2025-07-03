"use client";

import animationData from "@/components/lottie/intro.mp4.lottie.json";
import Lottie from "lottie-react";
import { useEffect, useRef } from "react";

const DigiLoader = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/assets/audio/intro.mp3");
    audioRef.current.volume = 0.8;
    audioRef.current.loop = false;
  }, []);

  return (
    <div className="fixed inset-0 z-50 w-full min-h-screen bg-[#EEF1EE]">
      <Lottie
        animationData={animationData}
        loop={false}
        autoplay
        className="w-full h-screen object-cover"
      />
    </div>
  );
};

export default DigiLoader;
