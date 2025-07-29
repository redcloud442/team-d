import { toast } from "@/hooks/use-toast";
import { hideAllWithdrawalRequest } from "@/services/Withdrawal/Member";
import { AdminWithdrawaldata } from "@/utils/types";
import { EyeOff, Loader2 } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

type AdminWithdrawalHideAllProps = {
  setRequestData: Dispatch<SetStateAction<AdminWithdrawaldata | null>>;
};

const AdminWithdrawalHideAll = ({
  setRequestData,
}: AdminWithdrawalHideAllProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleHideAll = async () => {
    try {
      setIsLoading(true);
      const take = 500;
      let skip = 1;

      while (true) {
        const response = await hideAllWithdrawalRequest({ take, skip });

        if (!response.count || response.count < take) {
          break;
        }

        skip += take;
      }

      setRequestData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          data: {
            ...prev.data,
            PENDING: {
              data: [],
              count: 0,
            },
          },
        };
      });

      toast({
        title: "Withdrawal requests hidden successfully",
        description: "All withdrawal requests have been hidden successfully",
      });
    } catch (e) {
      toast({
        title: "Error hiding withdrawal requests",
        description: "An error occurred while hiding the withdrawal requests",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="card" size="sm" className="rounded-md">
          <EyeOff />
          Hide All
        </Button>
      </DialogTrigger>
      <DialogContent type="earnings">
        <DialogHeader>
          <DialogTitle>
            Are you sure you want to hide all the withdrawal requests?
          </DialogTitle>
          <DialogDescription>
            This action can affect withdrawal request of the pending users.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            size="sm"
            className="rounded-md"
            onClick={handleHideAll}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              " Proceed to hide"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminWithdrawalHideAll;
