"use client";

import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";

type Props = {
  className?: string;
  direction?: "left" | "right" | "up" | "down";
};

const CustomChevron = ({ className, direction = "right" }: Props) => {
  // Mapping directions to respective icons
  const ChevronIcon =
    direction === "left"
      ? ChevronLeft
      : direction === "right"
        ? ChevronRight
        : direction === "up"
          ? ChevronUp
          : ChevronDown;

  return (
    <div
      className={cn(
        "hidden md:flex space-x-1",
        direction === "up" || direction === "down"
          ? "flex-col space-x-0 space-y-1"
          : "",
        className
      )}
    >
      {[...Array(4)].map((_, index) => (
        <ChevronIcon
          key={index}
          className={cn("w-10 h-10", `animate-pulse delay-[${index * 200}ms]`)}
        />
      ))}
    </div>
  );
};

export default CustomChevron;
