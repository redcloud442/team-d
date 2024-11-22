import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PhilippinePeso } from "lucide-react";

type Props = {
  title: string;
  value: number;
  description?: string;
  descriptionClassName?: string;
  children?: React.ReactNode; // For dynamic content like charts or additional components
};

const CardAmount = ({
  title,
  value,
  description,
  descriptionClassName = "text-sm text-gray-500",
  children,
}: Props) => {
  return (
    <Card className="w-full sm:max-w-lg">
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
