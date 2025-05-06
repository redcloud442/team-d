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
import WithdrawalHistoryTable from "@/components/WithrawalHistoryPage/WithdrawalHistoryTable";
import { company_member_table } from "@prisma/client";
import { useState } from "react";

type Props = {
  teamMemberProfile: company_member_table;
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
      <DialogContent type="table" className="overflow-x-auto">
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <WithdrawalHistoryTable teamMemberProfile={teamMemberProfile} />
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardWithdrawModalHistory;
