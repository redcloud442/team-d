import { HeirarchyData } from "@/utils/types";
import { useRouter } from "next/navigation";

type Props = {
  data: HeirarchyData[];
};

export const HierarchyList = ({ data }: Props) => {
  const router = useRouter();

  const handleUserClick = (memberId: string) => {
    router.push(`/admin/users/${memberId}`);
  };

  return (
    <div className="text-sm font-medium text-gray-700">
      {data.map((node, index) => (
        <div
          key={node.company_member_id}
          className="flex items-center gap-2 ml-[calc(10px*index)]"
        >
          {/* Arrow indicating hierarchy */}
          {index !== 0 && <span className="text-gray-500">→</span>}

          {/* User Icon */}
          <div className="w-3 h-3 bg-gray-950 rounded-full"></div>

          {/* Username */}
          <span
            className="cursor-pointer underline underline-offset-4 text-blue-500 text-lg"
            onClick={() => handleUserClick(node.company_member_id)}
          >
            {node.user_username}
          </span>
        </div>
      ))}
    </div>
  );
};
