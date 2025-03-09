"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { handleWheelSpin } from "@/services/Wheel/Member";
import { useDailyTaskStore } from "@/store/useDailyTaskStore";
import { useUserEarningsStore } from "@/store/useUserEarningsStore";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";

const Wheel = dynamic(
  () => import("react-custom-roulette").then((mod) => mod.Wheel),
  {
    ssr: false,
  }
);

type Props = {
  prizes: {
    alliance_wheel_settings_id: string;
    alliance_wheel_settings_label: string;
    alliance_wheel_settings_percentage: number;
    alliance_wheel_settings_color: string;
  }[];
};

export const SpinWheel = ({ prizes }: Props) => {
  const [spinning, setSpinning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [winSound, setWinSound] = useState<HTMLAudioElement | null>(null);
  const [loseSound, setLoseSound] = useState<HTMLAudioElement | null>(null);
  const [spinSound, setSpinSound] = useState<HTMLAudioElement | null>(null);

  const { dailyTask, setDailyTask } = useDailyTaskStore();

  const [selectedPrize, setSelectedPrize] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState(false);

  const { earnings, setEarnings } = useUserEarningsStore();

  useEffect(() => {
    if (isOpen) {
      setWinSound(new Audio("/assets/sounds/winning.mp3"));
      setLoseSound(new Audio("/assets/sounds/losing.mp3"));
      setSpinSound(new Audio("/assets/sounds/spin.mp3"));
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedPrize) {
      setSpinning(true);
    }
  }, [selectedPrize]);

  const handleSpin = async () => {
    if (spinning) return;

    if (dailyTask.wheelLog.alliance_wheel_spin_count <= 0) {
      toast({
        title: "No spins left",
        description: "You have no more spins left",
        variant: "destructive",
      });
      return;
    }

    setShowConfetti(false);
    setSelectedPrize(null);

    setTimeout(() => {
      if (spinSound) {
        spinSound.currentTime = 0;
        spinSound.play();
      }
    }, 4000);

    try {
      const response = await handleWheelSpin();
      const prizeIndex = response.prize as string;

      setSelectedPrize(prizeIndex);
    } catch (error) {
      setSpinning(false);
    }
  };

  const handleWheelData = () => {
    setSpinning(false);
    if (spinSound) {
      spinSound.pause();
    }
    if (selectedPrize === "RE-SPIN") {
      setShowConfetti(true);
      winSound?.play();
    } else if (selectedPrize === "NO REWARD") {
      loseSound?.play();
      setDailyTask({
        ...dailyTask,
        wheelLog: {
          ...dailyTask.wheelLog,
          alliance_wheel_spin_count:
            dailyTask.wheelLog.alliance_wheel_spin_count - 1,
        },
      });
    } else {
      setShowConfetti(true);
      setDailyTask({
        ...dailyTask,
        wheelLog: {
          ...dailyTask.wheelLog,
          alliance_wheel_spin_count:
            dailyTask.wheelLog.alliance_wheel_spin_count - 1,
        },
      });
      if (!earnings) return;

      setEarnings({
        ...earnings,
        alliance_winning_earnings:
          earnings.alliance_winning_earnings + Number(selectedPrize),
        alliance_combined_earnings:
          earnings.alliance_combined_earnings + Number(selectedPrize),
      });
      winSound?.play();
    }
  };

  const wheelData = prizes.map((prize) => ({
    option:
      prize.alliance_wheel_settings_label !== "NO REWARD" &&
      prize.alliance_wheel_settings_label !== "RE-SPIN"
        ? `₱ ${Number(prize.alliance_wheel_settings_label).toLocaleString(
            "en-US",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )}`
        : prize.alliance_wheel_settings_label,
    style: { backgroundColor: prize.alliance_wheel_settings_color },
  }));

  const prizeNumberLogic =
    selectedPrize === "NO REWARD"
      ? 10
      : selectedPrize === "RE-SPIN"
        ? 9
        : Math.max(
            0,
            prizes.findIndex(
              (prize) => prize.alliance_wheel_settings_label === selectedPrize
            )
          );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(value) => {
        if (spinning) return;

        setIsOpen(value);

        if (!value) {
          setSelectedPrize(null);
          setShowConfetti(false);
          setSpinning(false);
          if (spinSound) {
            spinSound.pause();
          }
        }
      }}
    >
      <DialogTrigger asChild>
        <Image
          src="/assets/wheel.png"
          alt="Wheel Logo"
          width={60}
          height={60}
          className="rounded-full cursor-pointer fixed bottom-18 sm:bottom-24 right-3 animate-pulse z-[9999] pointer-events-auto hover:rotate-180 transition-transform duration-1000"
          onClick={() => setIsOpen(true)}
        />
      </DialogTrigger>
      <DialogContent className="p-1 sm:p-1">
        <DialogHeader>
          <DialogTitle>
            Prime Wheel | Spin:{" "}
            <span className="font-bold text-green-800">
              {dailyTask?.wheelLog?.alliance_wheel_spin_count ?? 0}
            </span>
          </DialogTitle>
          <DialogDescription>
            Spin the wheel to earn random rewards!
          </DialogDescription>
        </DialogHeader>
        {showConfetti && <Confetti width={440} height={600} />}
        <div className="flex flex-col items-center justify-start space-y-6 mt-4">
          <div className="relative">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999]">
              <Image
                src="/app-logo.png"
                alt="Center Logo"
                width={80}
                height={80}
                className="rounded-full cursor-pointer z-[9999]"
                onClick={handleSpin}
              />
            </div>
            <Wheel
              mustStartSpinning={spinning}
              prizeNumber={prizeNumberLogic}
              data={wheelData}
              onStopSpinning={handleWheelData}
              textColors={["#ffffff"]}
            />
          </div>
          {selectedPrize && !spinning && (
            <motion.div
              className="mt-4 text-2xl font-bold text-center text-green-600"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {selectedPrize === "NO REWARD"
                ? "😢 No reward this time."
                : selectedPrize === "RE-SPIN"
                  ? "🎉 You won: RE-SPIN 🎉"
                  : `🎉 You won: ₱ ${Number(selectedPrize).toLocaleString(
                      "en-US",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )} 🎉`}
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
