import { useToast } from "@/hooks/use-toast";
import { hideUser } from "@/services/Withdrawal/Admin";
import { AdminWithdrawaldata } from "@/utils/types";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

type Props = {
  user_userName: string;
  alliance_member_id: string;
  hiddenUser: boolean;
  setRequestData: Dispatch<SetStateAction<AdminWithdrawaldata | null>>;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

const AdminWithdrawalModal = ({
  user_userName,
  alliance_member_id,
  hiddenUser,
  setRequestData,
  status,
}: Props) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleHideUser = async () => {
    try {
      setIsLoading(true);

      const actionType = hiddenUser ? "remove" : "add";
      await hideUser({ id: alliance_member_id, type: actionType });

      setRequestData((prev) => {
        if (!prev) return prev;

        const statusList =
          prev.data[status as keyof typeof prev.data]?.data ?? [];
        const updatedItem = statusList.find(
          (item) => item.alliance_member_id === alliance_member_id
        );
        const newStatusList = statusList.filter(
          (item) => item.alliance_member_id !== alliance_member_id
        );

        if (!updatedItem) return prev;

        return {
          ...prev,
          data: {
            ...prev.data,
            [status]: {
              ...prev.data[status],
              data: newStatusList,
              count: newStatusList.length,
            },
          },
        };
      });

      toast({
        title: hiddenUser
          ? "User unhidden successfully"
          : "User hidden successfully",
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Failed to update user visibility",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer" variant="card" size="icon">
          {hiddenUser ? <EyeOff /> : <Eye />}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {hiddenUser
              ? "Are you sure you want to unhide this user?"
              : "Are you sure you want to hide this user?"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Username</p>
            <p className="text-sm font-bold">{user_userName}</p>
          </div>
          <Button
            className="rounded-md"
            disabled={isLoading}
            variant="destructive"
            onClick={handleHideUser}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Confirm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminWithdrawalModal;
