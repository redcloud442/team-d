"use client";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useState } from "react";

const DashboardWithdrawGuideModal = ({
  type,
}: {
  type: "avail" | "withdraw" | "deposit" | "register" | "refer";
}) => {
  const storageKey = "hidden-modal-guides"; // Store hidden types in localStorage
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    setIsModalOpen(false);

    if (dontShowAgain) {
      const hiddenGuidesStr = localStorage.getItem(storageKey);
      const hiddenGuides: string[] = hiddenGuidesStr
        ? JSON.parse(hiddenGuidesStr)
        : [];

      if (!hiddenGuides.includes(type)) {
        hiddenGuides.push(type);
        localStorage.setItem(storageKey, JSON.stringify(hiddenGuides));
      }
    }
  };

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={(open) => {
        setIsModalOpen(open);
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          className={`h-8 bg-pageColor px-2 text-sm text-white rounded-md ${
            type === "withdraw" || type === "register" || type === "refer"
              ? "w-full"
              : ""
          }`}
          type="button"
          variant="card"
        >
          How to {type}
        </Button>
      </DialogTrigger>

      <DialogContent className="flex flex-col justify-center items-center">
        <DialogHeader>
          <DialogTitle className="text-xl">How to {type}</DialogTitle>
        </DialogHeader>
        <DialogDescription />

        <Carousel className="w-full max-w-xs" opts={{ align: "start" }}>
          <CarouselContent>
            <CarouselItem>
              <Image
                src={`/guides/${type === "withdraw" ? "7" : type === "deposit" ? "4" : type === "register" ? "6" : type === "refer" ? "5" : "2"}.png`} // Dynamically change image per type
                alt={`${type} guide`}
                width={1200}
                height={1200}
                className="w-full h-full object-cover"
              />
            </CarouselItem>
          </CarouselContent>
        </Carousel>

        {/* Checkbox for 'Do not show again' */}
        {/* <div className="flex items-start gap-2 mt-4">
          <Input
            type="checkbox"
            id={`dont-show-again-${type}`}
            checked={dontShowAgain}
            onChange={() => setDontShowAgain(!dontShowAgain)}
            className="w-4 h-4"
          />
          <label htmlFor={`dont-show-again-${type}`} className="text-sm">
            By clicking this, you agree not to see this guide again
            automatically.
          </label>
        </div> */}
      </DialogContent>
    </Dialog>
  );
};

export default DashboardWithdrawGuideModal;
