import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  title: string;
  value: string;
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
        <CardDescription className="text-xl font-bold">{value}</CardDescription>
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
