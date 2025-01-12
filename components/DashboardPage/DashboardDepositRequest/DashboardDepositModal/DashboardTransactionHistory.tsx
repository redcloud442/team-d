import TransactionHistoryTable from "@/components/TransactionHistoryPage/TransactionHistoryTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { getReferralData } from "@/services/User/User";
import {
  alliance_member_table,
  alliance_referral_link_table,
} from "@prisma/client";
import { DialogTitle } from "@radix-ui/react-dialog";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import Image from "next/image";
import { useEffect, useState } from "react";

type Props = {
  teamMemberProfile: alliance_member_table;
  referal: alliance_referral_link_table;
  className: string;
};

const DashboardDepositModalRefer = ({
  teamMemberProfile,
  referal,
  className,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [referralData, setReferralData] = useState<{
    direct: {
      sum: number;
      count: number;
    };
    indirect: {
      sum: number;
      count: number;
    };
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleFetchReferralData = async () => {
      if (!open || referralData) return;
      try {
        const referralData = await getReferralData();
        if ("error" in referralData) {
          toast({
            title: "Error",
            description: "Internal server error",
            variant: "destructive",
          });
          return;
        }
        setReferralData(referralData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Internal server error",
          variant: "destructive",
        });
      }
    };

    handleFetchReferralData();
  }, [open, referralData]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button
          className={`relative h-48 flex sm:flex-row flex-col items-start justify-start sm:justify-between sm:items-start px-4 text-lg sm:text-2xl pt-6 sm:pt-8 ${className}`}
          onClick={() => setOpen(true)}
        >
          <div className="flex flex-col items-start justify-start sm:justify-start sm:items-start ">
            <p className="font-bold">Transaction</p>
            <p className=" font-bold">History</p>
          </div>

          {/* Position the image in the corner */}
          <div className="flex flex-col items-end justify-start sm:justify-center sm:items-center">
            <Image
              src="/assets/transaction-history.png"
              alt="Transaction History"
              width={250}
              height={250}
              priority
              className="absolute sm:relative bottom-0 sm:bottom-2 sm:left-10 -right-8"
            />
          </div>
        </Button>
      </DialogTrigger>

      <DialogContent
        type="table"
        className="w-[400px] sm:w-[600px] dark:bg-cardColor border-none shadow-none overflow-auto"
      >
        <ScrollArea className="h-[500px] sm:h-full">
          <DialogTitle className="text-2xl font-bold mb-4">
            Transaction History
          </DialogTitle>
          <TransactionHistoryTable teamMemberProfile={teamMemberProfile} />
          <DialogFooter className="flex justify-center"></DialogFooter>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardDepositModalRefer;
