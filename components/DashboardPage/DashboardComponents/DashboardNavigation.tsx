import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRole } from "@/utils/context/roleContext";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";
const DashboardNavigation = () => {
  const { profile } = useRole();
  const router = useRouter();

  return (
    <div className="flex items-end">
      <div className="flex items-center gap-3">
        <Avatar
          className="w-10 h-10 bg-blue-500 cursor-pointer"
          onClick={() => router.push("/profile")}
        >
          <AvatarImage src={profile?.user_profile_picture ?? ""} />
          <AvatarFallback className="bg-sky-500">
            <User size={24} />
          </AvatarFallback>
        </Avatar>
        <div className="space-x-1 text-md sm:text-xl font-semibold flex">
          <span>Welcome Back!</span>
          <div className="flex items-center">
            <span className="text-bg-primary-blue">
              {profile?.user_username}
            </span>
            <span>!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardNavigation;
