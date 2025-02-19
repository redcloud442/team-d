import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useDepositStore } from "@/store/useDepositStore";
import { useEffect, useState } from "react";

const DashboardVideoModal = () => {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { deposit, setDeposit } = useDepositStore();
  useEffect(() => {
    const handleOpen = () => {
      const isLoggedIn = localStorage.getItem("isModalOpen");
      if (isLoggedIn === "true") {
        setIsLoggedIn(true);
        setOpen(true);
      }
    };

    handleOpen();
  }, []);

  const handleDeposit = () => {
    setDeposit(true);
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen && isLoggedIn) {
          localStorage.setItem("isModalOpen", "false");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          className="w-full max-w-[140px] min-w-[120px] h-7"
          onClick={() => setOpen(true)}
        >
          How to Earn
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[400px] sm:w-[600px] dark:bg-cardColor border-none shadow-none overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-start">How to Earn </DialogTitle>
        </DialogHeader>
        <ScrollArea className="sm:h-full mt-4 rounded-lg">
          <video
            src="/assets/pr1me_crypto_service.mp4"
            autoPlay
            muted
            loop
            controls
            className="w-full h-full"
          />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <DialogFooter className="flex justify-center">
          <Button
            variant="card"
            className="w-full h-12 rounded-md cursor-pointer"
            onClick={handleDeposit}
          >
            Deposit Here
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardVideoModal;
