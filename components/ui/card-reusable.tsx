import { cn } from "@/lib/utils"; // or wherever your `cn` utility is
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";

type ReusableCardProps = {
  title?: string | null;
  description?: string | null;
  children: React.ReactNode;
  className?: string; // <-- add this
  type?: "admin" | "user";
};

const ReusableCard = ({
  title = null,
  description = null,
  children,
  className,
  type = "user",
}: ReusableCardProps) => {
  return (
    <Card
      className={`bg-[url('/assets/card/cardbg.png')]  bg-center bg-transparent ${
        type === "admin"
          ? "max-w-lg bg-auto"
          : "max-w-full bg-no-repeat bg-blend-blend h-auto"
      } border-2 dark:border-orange-600 border-orange-600 p-6`}
    >
      {(title || description) && (
        <CardHeader>
          {title && (
            <CardTitle className="text-white text-3xl stroke-text-orange font-bold text-center">
              {title}
            </CardTitle>
          )}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={cn(className, "mx-auto")}>{children}</CardContent>
    </Card>
  );
};

export default ReusableCard;
