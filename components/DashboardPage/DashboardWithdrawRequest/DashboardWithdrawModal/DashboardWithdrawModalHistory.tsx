import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import WithdrawalHistoryPage from "@/components/WithrawalHistoryPage/WithdrawalHistoryPage";
import { alliance_member_table } from "@prisma/client";
import { useState } from "react";

type Props = {
  teamMemberProfile: alliance_member_table;
};
const DashboardWithdrawModalHistory = ({ teamMemberProfile }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setOpen(true)}>
          History
        </Button>
      </DialogTrigger>
      <DialogContent type="table">
        <DialogHeader>
          <DialogTitle>History</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <WithdrawalHistoryPage teamMemberProfile={teamMemberProfile} />
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardWithdrawModalHistory;
