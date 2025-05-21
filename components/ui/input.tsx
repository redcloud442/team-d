import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "non-card";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          `flex h-10 w-full ${variant === "default" ? "bg-white text-black dark:placeholder:text-black " : "bg-white text-center dark:placeholder:text-black "} rounded-md px-3 py-4 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-950 font-bold focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:file:text-neutral-50 dark:placeholder:text-black dark:focus-visible:ring-neutral-300 z-50`,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
