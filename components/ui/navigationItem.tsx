import Link from "next/link";
import { usePathname } from "next/navigation";

const NavigationItem = ({
  item,
}: {
  item: { url: string; icon: React.ElementType; title: string };
}) => {
  const pathname = usePathname();
  const isActive = pathname === item.url;

  return (
    <Link
      className={`flex items-center space-x-2 ${
        isActive ? "text-blue-500 font-bold" : "text-gray-700"
      }`}
      href={item.url}
    >
      <item.icon />
      <span>{item.title}</span>
    </Link>
  );
};

export default NavigationItem;
