import HistoryPage from "@/components/HistoryPage/HistoryPage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const DashboardHistory = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="h-12 text-xl font-bold w-full">History</Button>
      </DialogTrigger>
      <DialogContent type="table">
        <DialogHeader className="hidden">
          <DialogTitle>History</DialogTitle>
          <DialogDescription>
            Please select a type to view the history.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="sm:h-auto h-[600px] space-y-4">
          <HistoryPage type="deposit" />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardHistory;
