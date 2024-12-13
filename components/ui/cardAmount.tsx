import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PhilippinePeso } from "lucide-react";
import { ReactNode } from "react";

type Props = {
  title: string;
  value: number;
  description?: ReactNode;
  descriptionClassName?: string;
  children?: React.ReactNode;
};

const CardAmount = ({
  title,
  value,
  description,
  descriptionClassName = "text-sm text-gray-500",
  children,
}: Props) => {
  return (
    <Card className="w-full md:min-w-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="flex gap-x-2 text-xl font-bold">
          <PhilippinePeso /> {value}
        </CardDescription>
        {description && (
          <CardDescription className={descriptionClassName}>
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default CardAmount;
