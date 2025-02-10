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
import { motion } from "framer-motion";
import { Loader2, Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const prizes = [
  { prize: 25, color: "#FF5733" },
  { prize: 50, color: "#33A1FF" },
  { prize: 150, color: "#85FF33" },
  { prize: 1000, color: "#FFC300" },
  { prize: 10000, color: "#DAF7A6" },
  { prize: "RE-SPIN", color: "#C70039" },
  { prize: "NO REWARD", color: "#581845" },
];

const buySpinSchema = z.object({
  quantity: z.number().min(1).max(100),
});

type BuySpinFormValues = z.infer<typeof buySpinSchema>;

export const SpinWheel = () => {
  const [spinning, setSpinning] = useState(false);
  const { dailyTask } = useDailyTaskStore();

  const [selectedPrize, setSelectedPrize] = useState<string | null>(null);

  const [count, setCount] = useState(
    dailyTask.wheelLog.alliance_wheel_spin_count
  ); // Initial 3 spins
  const [rotation, setRotation] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [buySpin, setBuySpin] = useState(false);

  const { toast } = useToast();
  const { earnings, setEarnings } = useUserEarningsStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BuySpinFormValues>({
    resolver: zodResolver(buySpinSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  console.log(earnings);
  const handleSpin = async () => {
    if (spinning) return;

    if (count <= 0) {
      setBuySpin(true);
      return;
    }

    setSpinning(true);
    setSelectedPrize(null);

    try {
      const response = await handleWheelSpin();
      const prizeIndex = response.prize as number | string;
      const prizeAmount = typeof prizeIndex === "number" ? prizeIndex : 0;

      const randomRotation = 360 * 15 + 100 * (360 / prizes.length);
      setRotation((prevRotation) => prevRotation + randomRotation);

      setTimeout(() => {
        setSpinning(false);
        setSelectedPrize(String(prizeIndex));

        if (prizeIndex === "RE-SPIN") {
          setCount((prev) => prev);
        } else {
          setCount((prev) => prev - 1);
          if (!earnings) return;

          setEarnings({
            ...earnings,
            alliance_winning_earnings:
              earnings.alliance_winning_earnings + Number(prizeAmount),
            alliance_combined_earnings:
              earnings.alliance_combined_earnings + Number(prizeAmount),
          });
        }
      }, 3000);
    } catch (error) {
      setSpinning(false);
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

      setCount(count + data.quantity);
      setBuySpin(false);

      toast({
        title: "Spin purchased",
        description: `You have purchased ${data.quantity} spins`,
      });

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
      onOpenChange={() => {
        setIsOpen(!isOpen);
        setSelectedPrize(null);
        setRotation(0);
      }}
    >
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Prime Wheel | Spin:{" "}
            <span className="font-bold text-green-800">{count}</span>
          </DialogTitle>
          <DialogDescription>Spin the wheel to earn rewards!</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-6 mt-4">
          <div className="relative">
            <motion.div
              className={`w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full border-[16px] border-black ${
                spinning ? "animate-pulse" : ""
              }`}
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
                  className="rounded-full cursor-pointer"
                  onClick={handleSpin}
                />
              </div>
            </motion.div>

            <div className="absolute top-[-16px] left-1/2 transform -translate-x-1/2 w-8 h-8 border-t-[20px] border-l-transparent border-r-transparent border-t-black"></div>
          </div>

          {/* Spin button and spin count */}
          <div className="flex flex-col justify-start items-start space-y-2 border-2">
            <Dialog open={buySpin} onOpenChange={() => setBuySpin(false)}>
              <DialogTrigger asChild>
                <Button type="button" variant={"card"} size="sm">
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
                        variant="non-card"
                        type="text"
                        readOnly
                        className="w-12 text-center p-0"
                        {...register("quantity")}
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
                      value={Number(quantityAmount)}
                      readOnly
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
