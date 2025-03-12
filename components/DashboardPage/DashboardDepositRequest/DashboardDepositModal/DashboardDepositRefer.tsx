import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import TableLoading from "@/components/ui/tableLoading";
import { useToast } from "@/hooks/use-toast";
import { DashboardEarnings } from "@/utils/types";
import {
  alliance_member_table,
  alliance_referral_link_table,
} from "@prisma/client";
import Image from "next/image";
import { useState } from "react";
import DashboardDynamicGuideModal from "../DashboardDynamicGuideModal/DashboardDynamicGuideModal";
import DashboardDirectReferral from "./DashboardDirectReferral";
import DashboardIndirectReferral from "./DashboardIndirectReferral";

type Props = {
  teamMemberProfile: alliance_member_table;
  referal: alliance_referral_link_table;
  className: string;
  isActive: boolean;
  totalEarnings: DashboardEarnings | null;
};

const DashboardDepositModalRefer = ({
  teamMemberProfile,
  referal,
  isActive,
  className,
  totalEarnings,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard!",
        description: "You can now share the link with your connections.",
      });
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button
          className={`relative h-48 flex flex-col items-start justify-start sm:justify-center sm:items-center px-4 text-lg sm:text-2xl pt-8 sm:pt-8 ${className}`}
          onClick={() => setOpen(true)}
        >
          Refer & Earn
          <div className="flex flex-col items-end justify-start sm:justify-center sm:items-center">
            <Image
              src="/assets/refer-a-friend.png"
              alt="Refer a Friend"
              width={200}
              height={200}
              priority
              className="absolute sm:relative top-10 sm:-top-4 sm:left-0 left-4"
            />
          </div>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] dark:bg-transparent p-0 border-none shadow-none">
        {isFetching && <TableLoading />}
        <ScrollArea className="h-[610px] sm:h-full ">
          <DialogDescription></DialogDescription>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold"></DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-end space-y-4">
            {/* Referral Link and Code */}

            <Card className="dark:bg-cardColor border-none">
              <CardHeader>
                <CardTitle className="text-black text-2xl flex justify-between ">
                  Refer & Earn
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-end gap-2">
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="referral_link"
                      className="font-bold dark:text-black"
                    >
                      Referral Link
                    </Label>
                    <Input
                      variant="default"
                      id="referral_link"
                      type="text"
                      readOnly
                      className="text-center"
                      value={referal.alliance_referral_link}
                    />
                  </div>

                  <Button
                    onClick={() =>
                      copyToClipboard(referal.alliance_referral_link)
                    }
                    className="bg-pageColor text-white h-12"
                  >
                    Copy
                  </Button>
                </div>
                <DashboardDynamicGuideModal type="refer" />
                <Image
                  src="/assets/referral-bonus.png"
                  alt="Refer a Friend"
                  width={1000}
                  height={1000}
                  className="w-full h-full"
                />
              </CardContent>
            </Card>

            <Card className="dark:bg-cardColor border-none w-full">
              <CardHeader>
                <CardTitle className="text-black text-xl"></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="direct_referrals"
                      className="font-bold dark:text-black"
                    >
                      Direct Bonus Earning
                    </Label>
                    <Input
                      variant="default"
                      id="direct_referrals"
                      readOnly
                      type="text"
                      className="text-center"
                      value={
                        "₱ " +
                        (totalEarnings?.directReferralAmount
                          ? totalEarnings.directReferralAmount.toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )
                          : "0.00")
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="multiple_referrals"
                      className="font-bold dark:text-black"
                    >
                      Multiple Bonus Earning
                    </Label>
                    <Input
                      variant="default"
                      id="multiple_referrals"
                      type="text"
                      readOnly
                      className="text-center"
                      value={
                        "₱ " +
                        (totalEarnings?.indirectReferralAmount
                          ? totalEarnings.indirectReferralAmount.toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )
                          : "0.00")
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-cardColor border-none w-full">
              <CardHeader>
                <CardTitle className="text-black text-xl"></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-around gap-2">
                  <div className="flex flex-col gap-2 items-center justify-center w-24">
                    <Label
                      htmlFor="referrals"
                      className="font-bold dark:text-black text-center"
                    >
                      Direct Referral
                    </Label>
                    <DashboardDirectReferral
                      teamMemberProfile={teamMemberProfile}
                      count={totalEarnings?.directReferralCount || 0}
                    />
                  </div>

                  <div className="flex flex-col gap-2 items-center justify-center w-24">
                    <Label
                      htmlFor="earnings"
                      className="font-bold dark:text-black text-center"
                    >
                      Multiple Referral
                    </Label>
                    <DashboardIndirectReferral
                      teamMemberProfile={teamMemberProfile}
                      count={totalEarnings?.indirectReferralCount || 0}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Earnings */}
          </div>
        </ScrollArea>
        <DialogFooter className="flex justify-center"></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardDepositModalRefer;
