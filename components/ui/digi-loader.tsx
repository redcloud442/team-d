"use client";

import animationData from "@/components/lottie/intro.mp4.lottie.json";
import Lottie from "lottie-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "./button";

type DigiLoaderProps = {
  onComplete: () => void;
};

const DigiLoader = ({ onComplete }: DigiLoaderProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio("/assets/audio/intro.mp3");
    audioRef.current.volume = 0.8;
    audioRef.current.loop = false;

    if (hasInteracted) {
      audioRef.current.play();
    }
  }, [hasInteracted]);

  const handleLottieComplete = () => {
    setHasInteracted(true);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 w-full min-h-screen bg-[#EEF1EE]">
      {hasInteracted ? (
        <Lottie
          animationData={animationData}
          loop={false}
          autoplay
          className="w-full h-screen object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-bg-primary text-white text-sm">
          <Button
            onClick={handleLottieComplete}
            className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-cyan-500 to-sky-500 hover:from-blue-600 hover:via-cyan-600 hover:to-sky-600 text-white w-72 h-72 rounded-full shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center"
          >
            {/* Animated shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 rounded-full"></div>

            {/* White glowing border */}
            <div className="absolute inset-0 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-colors duration-300"></div>

            {/* Subtle rotating ring */}
            <div
              className="absolute inset-0 rounded-full border border-white/10 animate-spin"
              style={{ animationDuration: "8s" }}
            ></div>

            {/* DIGI Icon */}
            <div className="flex flex-col items-center justify-center">
              <Image
                src="/assets/icons/digi.webp"
                alt="DIGI logo"
                width={250}
                height={250}
                className="w-48 h-48 z-10"
              />
              <p className="text-white text-lg font-bold">OPEN DASHBOARD</p>
            </div>

            {/* Hover blue glow aura */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-sky-500 opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-300 -z-10 scale-150"></div>
          </Button>
        </div>
      )}
    </div>
  );
};

export default DigiLoader;
