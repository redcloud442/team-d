import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center p-2 justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:focus-visible:ring-neutral-300 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-bg-primary-blue rounded-sm font-bold text-md text-black shadow-sm cursor-pointer ",
        card: "bg-bg-primary-blue rounded-sm font-bold text-md text-black shadow-sm cursor-pointer",
        destructive:
          "bg-red-500 text-neutral-50 shadow-xs hover:bg-red-500/90 dark:bg-red-900 dark:text-neutral-50 dark:hover:bg-red-900/90",
        outline:
          "border border-bg-primary-blue bg-bg-primary shadow-xs hover:bg-neutral-100 hover:text-neutral-900 dark:border-bg-primary-blue dark:bg-bg-primary dark:hover:bg-neutral-800 dark:hover:text-neutral-50 rounded-md cursor-pointer",
        secondary:
          "bg-neutral-100 text-neutral-900 shadow-xs hover:bg-neutral-100/80 dark:bg-neutral-800 dark:text-neutral-50 dark:hover:bg-neutral-800/80",
        ghost:
          "p-0 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 cursor-pointer",
        link: "text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-50 cursor-pointer",
      },
      size: {
        default: "h-8",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
