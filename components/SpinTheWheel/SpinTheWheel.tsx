import { handleWheelSpin } from "@/services/Wheel/Member";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import Confetti from "react-confetti";

const prizes = [
  { label: 25, color: "#FF5733" }, // Orange
  { label: 50, color: "#33A1FF" }, // Blue
  { label: 150, color: "#85FF33" }, // Green
  { label: 1000, color: "#FFC300" }, // Yellow
  { label: 10000, color: "#DAF7A6" }, // Light green
  { label: "RE-SPIN", color: "#C70039" }, // Red
  { label: "NO REWARD", color: "#581845" }, // Purple
];

export const SpinWheel = () => {
  const [spinning, setSpinning] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<string | number | null>(
    null
  );
  const [count, setCount] = useState(3); // Initial 3 spins
  const [rotation, setRotation] = useState(0);

  const handleSpin = async () => {
    if (spinning || count <= 0) return;

    setSpinning(true);
    setSelectedPrize(null);

    try {
      const response = await handleWheelSpin(); // Call backend to get prize index
      const prizeIndex =
        typeof response.prize === "number"
          ? response.prize
          : Math.floor(Math.random() * prizes.length);
      const prize = prizes[prizeIndex];

      // Simulate spinning
      const randomRotation = 360 * 3 + prizeIndex * (360 / prizes.length);
      setRotation((prevRotation) => prevRotation + randomRotation);

      setTimeout(() => {
        setSpinning(false);
        setSelectedPrize(prize.label);

        // Handle "RE-SPIN" or spin count reduction
        if (prize.label === "RE-SPIN") {
          setCount((prev) => prev); // No change for "RE-SPIN"
        } else if (prize.label === "NO REWARD") {
          setCount((prev) => prev - 1); // Deduct spin for "NO REWARD"
        } else {
          setCount((prev) => prev - 1); // Deduct spin for regular rewards
        }
      }, 4000); // Duration of spin animation
    } catch (error) {
      console.error("Spin error:", error);
      setSpinning(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6">
      {/* Confetti for winning prizes */}
      {selectedPrize && typeof selectedPrize === "number" && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
        />
      )}

      {/* Wheel */}
      <div className="relative">
        <motion.div
          className={`w-[500px] h-[500px] rounded-full border-[16px] border-black ${spinning ? "animate-pulse" : ""}`}
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: "easeInOut" }}
          style={{
            backgroundImage: `conic-gradient(${prizes
              .map((prize, index) => {
                const angle = (index / prizes.length) * 360;
                return `${prize.color} ${angle}deg ${angle + 360 / prizes.length}deg`;
              })
              .join(", ")})`,
          }}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Image
              src="/app-logo.png"
              alt="Center Logo"
              width={80}
              height={80}
              className="rounded-full"
            />
          </div>
        </motion.div>

        <div className="absolute top-[-16px] left-1/2 transform -translate-x-1/2 w-8 h-8 border-t-[20px] border-l-transparent border-r-transparent border-t-black"></div>
      </div>

      {/* Spin button and spin count */}
      <div className="flex flex-col items-center space-y-2">
        <button
          onClick={handleSpin}
          disabled={spinning || count <= 0}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg shadow-md transition-transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {spinning ? "Spinning..." : `Spin the Wheel (${count} left)`}
        </button>
        {count <= 0 && (
          <p className="text-red-600 font-bold">No spins left for today!</p>
        )}
      </div>

      {/* Display selected prize */}
      {selectedPrize && (
        <motion.div
          className="mt-4 text-2xl font-bold text-center text-green-600"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {selectedPrize === "NO REWARD"
            ? "😢 No reward this time."
            : `🎉 You won: ${selectedPrize} 🎉`}
        </motion.div>
      )}
    </div>
  );
};
