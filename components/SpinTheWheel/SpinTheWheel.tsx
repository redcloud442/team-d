"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { handleBuyWheelSpin, handleWheelSpin } from "@/services/Wheel/Member";
import { useDailyTaskStore } from "@/store/useDailyTaskStore";
import { useUserEarningsStore } from "@/store/useUserEarningsStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { alliance_wheel_settings_table } from "@prisma/client";
import { motion } from "framer-motion";
import { Loader2, Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const buySpinSchema = z.object({
  quantity: z.number().min(1),
});

type BuySpinFormValues = z.infer<typeof buySpinSchema>;

type Props = {
  prizes: alliance_wheel_settings_table[];
};

export const SpinWheel = ({ prizes }: Props) => {
  console.log(prizes);
  const [spinning, setSpinning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [winSound, setWinSound] = useState<HTMLAudioElement | null>(null);
  const [loseSound, setLoseSound] = useState<HTMLAudioElement | null>(null);

  const { dailyTask, setDailyTask } = useDailyTaskStore();

  const [selectedPrize, setSelectedPrize] = useState<string | null>(null);

  const [rotation, setRotation] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [buySpin, setBuySpin] = useState(false);

  const { toast } = useToast();
  const { earnings, setEarnings } = useUserEarningsStore();

  useEffect(() => {
    if (isOpen) {
      setWinSound(new Audio("/assets/sounds/winning.mp3"));
      setLoseSound(new Audio("/assets/sounds/losing.mp3"));
    }
  }, [isOpen]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BuySpinFormValues>({
    resolver: zodResolver(buySpinSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  const handleSpin = async () => {
    if (spinning) return;

    if (dailyTask.wheelLog.alliance_wheel_spin_count <= 0) {
      setBuySpin(true);
      return;
    }

    setSpinning(true);
    setSelectedPrize(null);

    try {
      const response = await handleWheelSpin();
      const prizeIndex = response.prize as number | string;
      const prizeAmount = typeof prizeIndex === "number" ? prizeIndex : 0;

      const randomRotation = 360 * 20 + 500 * (360 / prizes.length);
      setRotation((prevRotation) => prevRotation + randomRotation);

      setTimeout(() => {
        setSpinning(false);
        setSelectedPrize(String(prizeIndex));

        if (prizeIndex === "RE-SPIN") {
          setShowConfetti(true);
          winSound?.play();
        } else if (prizeIndex === "NO REWARD") {
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
              earnings.alliance_winning_earnings + Number(prizeAmount),
            alliance_combined_earnings:
              earnings.alliance_combined_earnings + Number(prizeAmount),
          });
          winSound?.play();
        }
      }, 3000);
    } catch (error) {
      setSpinning(false);
    } finally {
      setShowConfetti(false);
    }
  };

  const handleBuySpin = async (data: BuySpinFormValues) => {
    try {
      if (
        !earnings?.alliance_combined_earnings ||
        earnings.alliance_combined_earnings < quantityAmount
      ) {
        toast({
          title: "Insufficient balance",
          description: "Please add more balance to your account",
          variant: "destructive",
        });
        return;
      }

      await handleBuyWheelSpin(data.quantity);

      let remainingAmount = Number(quantityAmount);

      const olympusDeduction = Math.min(
        remainingAmount,
        earnings.alliance_olympus_earnings
      );

      remainingAmount -= olympusDeduction;

      const referralDeduction = Math.min(
        remainingAmount,
        earnings.alliance_referral_bounty
      );
      remainingAmount -= referralDeduction;

      const winningDeduction = Math.min(
        remainingAmount,
        earnings.alliance_winning_earnings
      );
      remainingAmount -= winningDeduction;

      setEarnings({
        ...earnings,
        alliance_combined_earnings:
          earnings.alliance_combined_earnings - Number(quantityAmount),
        alliance_olympus_earnings:
          earnings.alliance_olympus_earnings - olympusDeduction,
        alliance_referral_bounty:
          earnings.alliance_referral_bounty - referralDeduction,
        alliance_winning_earnings:
          earnings.alliance_winning_earnings - winningDeduction,
      });

      setDailyTask({
        ...dailyTask,
        wheelLog: {
          ...dailyTask.wheelLog,
          alliance_wheel_spin_count:
            dailyTask.wheelLog.alliance_wheel_spin_count + data.quantity,
        },
      });
      setBuySpin(false);

      toast({
        title: "Spin purchased",
        description: `You have purchased ${data.quantity} spins`,
      });

      reset();
      // const response = await handleBuyWheelSpin(data.quantity);
    } catch (error) {
      toast({
        title: "Error buying spin",
        description: "Please try again later",
      });
    }
  };

  const quantityAmount = watch("quantity") * 50;
  const quantity = watch("quantity");

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(value) => {
        setIsOpen(value); // Properly update the dialog state
        if (!value) {
          setSelectedPrize(null);
          setRotation(0);
          setShowConfetti(false);
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
      <DialogContent className="p-1 sm:p-4">
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
        <div className="flex flex-col items-center justify-start space-y-6 mt-4  ">
          <div className="relative">
            <motion.div
              className={`w-[350px] h-[350px] sm:w-[400px] sm:h-[400px] rounded-full border-[10px] border-black text-white ${
                spinning ? "animate-pulse" : ""
              }`}
              animate={{ rotate: rotation }}
              transition={{ duration: 3, ease: "easeInOut" }}
              style={{
                backgroundImage: `conic-gradient(${prizes
                  .map((prize, index) => {
                    const angle = (index / prizes.length) * 360;
                    return `${prize.alliance_wheel_settings_color} ${angle}deg ${angle + 360 / prizes.length}deg`;
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
                  className="rounded-full cursor-pointer"
                  onClick={handleSpin}
                />
              </div>
              <div
                className="absolute top-1/2 left-1/2 origin-[0_-160px] sm:origin-[0_-160px]"
                style={{
                  transform: `rotate(70deg)  translateY(-130px) rotate(-70deg)`, // Keeps the label upright
                }}
              >
                <div
                  className="text-white text-center"
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    transform: `rotate(-10deg)`, // Rotate text vertically
                  }}
                >
                  ₱ {prizes[0].alliance_wheel_settings_label}
                </div>
              </div>

              <div
                className="absolute top-1/2 left-1/2 origin-[0_-160px]"
                style={{
                  transform: `rotate(125deg)  translateY(-130px) rotate(-122deg)`, // Keeps the label upright
                }}
              >
                <div
                  className="text-white text-center"
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    transform: `rotate(40deg)`, // Rotate text vertically
                  }}
                >
                  ₱ {prizes[1].alliance_wheel_settings_label}
                </div>
              </div>

              <div
                className="absolute top-1/2 left-1/2 origin-[0_-160px]"
                style={{
                  transform: `rotate(161deg)  translateY(-130px)rotate(-140deg)`, // Keeps the label upright
                }}
              >
                <div
                  className="text-white text-center"
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    transform: `rotate(70deg)`, // Rotate text vertically
                  }}
                >
                  ₱ {prizes[2].alliance_wheel_settings_label}
                </div>
              </div>

              <div
                className="absolute top-1/2 left-1/2 origin-[0_-160px]"
                style={{
                  transform: `rotate(-123deg)  translateY(-130px) rotate(127deg)`, // Keeps the label upright
                }}
              >
                <div
                  className="text-white text-center"
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    transform: `rotate(140deg)`, // Rotate text vertically
                  }}
                >
                  ₱ {prizes[3].alliance_wheel_settings_label}
                </div>
              </div>

              <div
                className="absolute top-1/2 left-1/2 origin-[0_-160px]"
                style={{
                  transform: `rotate(-72deg)  translateY(-140px) rotate(80deg)`, // Keeps the label upright
                }}
              >
                <div
                  className="text-white text-center"
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    transform: `rotate(10deg)`, // Rotate text vertically
                  }}
                >
                  {prizes[4].alliance_wheel_settings_label}
                </div>
              </div>

              <div
                className="absolute top-1/2 left-1/2 origin-[0_-160px]"
                style={{
                  transform: `rotate(-10deg)  translateY(-130px) rotate(30deg)`, // Keeps the label upright
                }}
              >
                <div
                  className="text-white text-center"
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    transform: `rotate(40deg)`, // Rotate text vertically
                  }}
                >
                  {prizes[5].alliance_wheel_settings_label}
                </div>
              </div>

              <div
                className="absolute top-1/2 left-1/2 origin-[0_-160px]"
                style={{
                  transform: `rotate(20deg)  translateY(-130px) rotate(-5deg)`, // Keeps the label upright
                }}
              >
                <div
                  className="text-white text-center"
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    transform: `rotate(90deg)`, // Rotate text vertically
                  }}
                >
                  {prizes[6].alliance_wheel_settings_label}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Spin button and spin count */}
          <div className="flex flex-col justify-start items-start space-y-2 border-2 z-index-dialog">
            <Dialog open={buySpin} onOpenChange={setBuySpin}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  onClick={() => setBuySpin(true)}
                  variant={"card"}
                  size="sm"
                >
                  <Plus /> Buy Spin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Buy Spin</DialogTitle>
                  <DialogDescription>
                    Spin the wheel to earn rewards!
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleBuySpin)}>
                  <div className="flex flex-col justify-start items-start space-y-2">
                    <div className="flex flex-col justify-start items-start space-y-2">
                      Balance: ₱{" "}
                      {earnings?.alliance_combined_earnings.toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </div>
                    <Label>Quantity</Label>

                    <div className="flex justify-center items-center space-x-2 w-full">
                      <Button
                        type="button"
                        variant={"card"}
                        size={"icon"}
                        onClick={() => {
                          if (quantity > 1) {
                            setValue("quantity", quantity - 1);
                          }
                        }}
                      >
                        <Minus />
                      </Button>

                      <Input
                        type="number"
                        variant="non-card"
                        className="w-12 text-center p-0"
                        {...register("quantity", {
                          valueAsNumber: true,
                          min: {
                            value: 1,
                            message: "Quantity must be at least 1",
                          },
                        })}
                      />

                      <Button
                        type="button"
                        variant={"card"}
                        size={"icon"}
                        onClick={() => setValue("quantity", quantity + 1)}
                      >
                        <Plus />
                      </Button>
                      {errors.quantity && (
                        <p className="text-red-500 text-sm">
                          {errors.quantity.message}
                        </p>
                      )}
                    </div>

                    <Label>Amount</Label>
                    <Input
                      type="number"
                      readOnly
                      value={Number(quantityAmount)}
                    />

                    <Button
                      type="submit"
                      variant={"card"}
                      disabled={isSubmitting}
                      className="w-full rounded-md"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin" />
                          Buying...
                        </>
                      ) : (
                        "Buy"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
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
      </DialogContent>
    </Dialog>
  );
};
