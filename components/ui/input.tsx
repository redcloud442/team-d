import * as React from "react";

import { cn } from "@/lib/utils";
import { Separator } from "./separator";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "non-card";
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 border-r-2 pr-2 border-bg-primary-blue">
            <div className="flex items-center justify-center w-4 h-4 text-white bg-clip-content rounded-full">
              {icon}
            </div>
            <Separator className="h-full w-2" orientation="vertical" />
          </div>
        )}

        <input
          type={type}
          className={cn(
            `flex h-10 w-full ${variant === "default" ? "bg-bg-primary border-2 border-bg-primary-blue text-white dark:placeholder:text-white " : "bg-bg-primary text-white dark:placeholder:text-white placeholder:text-white border-2 border-bg-primary-blue "} rounded-md px-3 py-4 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-950 font-bold focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:file:text-neutral-50 dark:placeholder:text-white dark:focus-visible:ring-neutral-300 z-50`,
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
