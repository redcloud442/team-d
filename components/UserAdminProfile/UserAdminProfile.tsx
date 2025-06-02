"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getUserByUsername } from "@/services/User/Admin";
import { useRole } from "@/utils/context/roleContext";
import { UserRequestdata } from "@/utils/types";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import TopUpHistoryTable from "../TopUpHistoryPage/TopUpHistoryTable";
import { Skeleton } from "../ui/skeleton";
import WithdrawalHistoryTable from "../WithrawalHistoryPage/WithdrawalHistoryTable";
import AdminCheckUserReferral from "./AdminCheckUserReferral";
import ChangePassword from "./ChangePassword";
import MerchantBalance from "./MerchantBalance";
import PersonalInformation from "./PersonalInformation";

type Props = {
  userProfile: UserRequestdata;
};

const UserAdminProfile = ({ userProfile: initialData }: Props) => {
  const { toast } = useToast();
  const { profile } = useRole();
  const [userProfileData] = useState<UserRequestdata>(initialData);

  const [isLoading, setIsLoading] = useState(false);
  const [userList, setUserList] = useState<UserRequestdata[]>([]);
  const [isSearchAlreadyDone, setIsSearchAlreadyDone] = useState(false);
  const router = useRouter();

  const { register, handleSubmit } = useForm<{
    search: string;
  }>({
    defaultValues: { search: "" },
  });

  const onSubmit = async (data: { search: string }) => {
    try {
      setIsLoading(true);
      setIsSearchAlreadyDone(true);

      const { search } = data;

      const response = await getUserByUsername({ username: search });

      setUserList(response.data);
      setIsLoading(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePath = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  return (
    <div className="mx-auto">
      <div className="w-full flex flex-col gap-6">
        {/* Page Title */}
        <header>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            User Profile {userProfileData.user_username}
          </h1>
          <p className="text-gray-600 dark:text-white">
            View all the withdrawal history that are currently in the system.
          </p>
        </header>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex items-center gap-3 bg-transparent p-2 rounded-lg shadow-md w-full"
        >
          {/* Search Input */}
          <Input
            type="text"
            placeholder="Search user..."
            className="flex-grow px-4 py-2 dark:text-white bg-transparent border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none"
            {...register("search")}
          />

          {/* Search Button */}
          <Button type="submit" variant="card" className="h-12 rounded-md">
            <Search className="w-5 h-5" />
          </Button>
        </form>

        {/* User List */}
        {isLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full max-w-lg h-12" />
            <Skeleton className="w-full max-w-md h-12" />
          </div>
        ) : (
          <>
            {userList.length > 0 ? (
              <div className="overflow-x-auto w-full bg-transparent rounded-lg p-4">
                <table className="w-full border-collapse">
                  {/* Table Header */}
                  <thead>
                    <tr className="bg-gray-200 dark:bg-stone-950 text-gray-700 dark:text-gray-300 uppercase text-sm font-semibold">
                      <th className="py-3 px-4 text-left">Username</th>
                      <th className="py-3 px-4 text-left">First Name</th>
                      <th className="py-3 px-4 text-left">Last Name</th>
                      <th className="py-3 px-4 text-left">Restricted</th>
                      <th className="py-3 px-4 text-left">Role</th>
                      <th className="py-3 px-4 text-left">Active</th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody>
                    {userList.map((user, index) => (
                      <tr
                        key={user.company_member_id}
                        className={`border-b dark:border-gray-700 ${
                          index % 2 === 0
                            ? "bg-gray-50 dark:bg-stone-700"
                            : "bg-white dark:bg-stone-700"
                        } hover:bg-gray-100 dark:hover:bg-stone-800 transition-all`}
                      >
                        <td
                          onClick={() => handleChangePath(user.user_id)}
                          className="py-3 px-4 cursor-pointer text-blue-500 hover:underline"
                        >
                          {user.user_username}
                        </td>
                        <td className="py-3 px-4">{user.user_first_name}</td>
                        <td className="py-3 px-4">{user.user_last_name}</td>
                        <td className="py-3 px-4">
                          {user.company_member_restricted ? "YES" : "NO"}
                        </td>
                        <td className="py-3 px-4">
                          {user.company_member_role}
                        </td>
                        <td className="py-3 px-4">
                          {user.company_member_is_active ? " YES" : "NO"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              isSearchAlreadyDone && (
                <div className="flex justify-center items-center h-40">
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    No users found
                  </p>
                </div>
              )
            )}
          </>
        )}

        {/* Profile Information */}
        <PersonalInformation userProfile={userProfileData} />
        {userProfileData.company_member_role === "MERCHANT" && (
          <MerchantBalance profile={profile} userProfile={userProfileData} />
        )}

        <AdminCheckUserReferral userProfile={userProfileData} />

        <ChangePassword userProfile={userProfileData} />

        <TopUpHistoryTable teamMemberProfile={userProfileData} />

        <WithdrawalHistoryTable teamMemberProfile={userProfileData} />
      </div>
    </div>
  );
};

export default UserAdminProfile;
