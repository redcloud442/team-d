import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils"; // or wherever your `cn` utility is
import React from "react";

type ReusableCardProps = {
  title?: string | null;
  description?: string | null;
  children: React.ReactNode;
  className?: string; // <-- add this
  type?: "gradient" | "default" | "gray";
};

const ReusableCardBg = ({
  title = null,
  description = null,
  children,
  className,
  type = "default",
}: ReusableCardProps) => {
  return (
    <Card
      className={cn(
        className,
        ` w-full border dark:border-orange-600 dark:text-black text-black `,
        type === "gradient"
          ? "bg-gradient-to-r from-yellow-300 to-orange-300"
          : type === "gray"
            ? "bg-gray-200 dark:bg-gray-200"
            : " dark:bg-amber-300 bg-amber-300"
      )}
    >
      {title ||
        (description && (
          <CardHeader className="text-center ">
            {title && (
              <CardTitle className="text-white text-3xl stroke-text-orange font-bold">
                {title}
              </CardTitle>
            )}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        ))}

      <CardContent className={cn(className, "mx-auto")}>{children}</CardContent>
    </Card>
  );
};

export default ReusableCardBg;
