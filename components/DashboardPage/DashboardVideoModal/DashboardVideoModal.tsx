import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useDepositStore } from "@/store/useDepositStore";
import { useEffect, useState } from "react";

const DashboardVideoModal = () => {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { setDeposit } = useDepositStore();
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
          className="w-full max-w-[140px] min-w-[120px] h-7 cursor-pointer"
          onClick={() => setOpen(true)}
        >
          How to Earn
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[400px] sm:w-[600px] dark:bg-cardColor border-none shadow-none overflow-auto">
        <DialogHeader></DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
};

export default DashboardVideoModal;
