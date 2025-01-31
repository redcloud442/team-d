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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserDashboardEarningsStore } from "@/store/useUserDashboardEarnings";
import Image from "next/image";
import { useState } from "react";

const DashboardEarningsModal = () => {
  const [open, setOpen] = useState(false);
  const { totalEarnings } = useUserDashboardEarningsStore();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full max-w-[140px] min-w-[120px] h-7"
          onClick={() => setOpen(true)}
        >
          Show Earnings
        </Button>
      </DialogTrigger>
      <DialogContent type="earnings" className="overflow-x-auto">
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="absolute inset-0 -z-10">
          {/* Background Image */}
          <Image
            src="/assets/bg-primary.jpeg"
            alt="Background"
            quality={100}
            fill
            priority
            className="object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-zinc-900/80 dark:bg-zinc-900/50"></div>
        </div>
        <Label className="text-center text-white">Total Earnings</Label>

        <Input
          placeholder="Total Earnings"
          className="w-full text-center relative bg-black border-none focus:ring-0 border-yellow-400 border-2 animate-tracing-border"
          value={
            "₱ " +
            totalEarnings?.totalEarnings?.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          }
          readOnly
        />

        <Label className="text-center text-white">Total Withdrawal</Label>
        <Input
          placeholder="Total Withdrawal"
          className="w-full text-center relative bg-black border-none focus:ring-0 border-yellow-400 border-2 animate-tracing-border"
          value={
            "₱ " +
            totalEarnings?.withdrawalAmount?.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          }
          readOnly
        />
        <Label className="text-center text-white">Direct Referral</Label>
        <Input
          placeholder="Direct Referral"
          className="w-full text-center relative bg-black border-none focus:ring-0 border-yellow-400 border-2 animate-tracing-border"
          value={
            "₱ " +
            totalEarnings?.directReferralAmount?.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          }
          readOnly
        />
        <Label className="text-center text-white">Mutiple Referral</Label>
        <Input
          placeholder="Mutiple Referral"
          className="w-full text-center relative bg-black border-none focus:ring-0 border-yellow-400 border-2 animate-tracing-border"
          value={
            "₱ " +
            totalEarnings?.indirectReferralAmount?.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          }
          readOnly
        />
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardEarningsModal;
