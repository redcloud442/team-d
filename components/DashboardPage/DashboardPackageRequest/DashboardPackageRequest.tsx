import PackageHistoryTable from "@/components/PackageHistory/PackageHistoryTable";
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
import { alliance_member_table } from "@prisma/client";

type Props = {
  teamMemberProfile: alliance_member_table;
};
const DashboardPackageRequest = ({ teamMemberProfile }: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={"sm"}>Package History</Button>
      </DialogTrigger>
      <DialogContent type="table" className="overflow-x-auto">
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <PackageHistoryTable teamMemberProfile={teamMemberProfile} />
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardPackageRequest;
