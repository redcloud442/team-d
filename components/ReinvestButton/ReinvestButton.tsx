import { useToast } from "@/hooks/use-toast";
import { ReinvestPackageHandler } from "@/services/Package/Member";
import { usePackageChartData } from "@/store/usePackageChartData";
import { useUserTransactionHistoryStore } from "@/store/useTransactionStore";
import { BONUS_MAPPING, REINVESTMENT_TYPE } from "@/utils/constant";
import { useRole } from "@/utils/context/roleContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { package_table } from "@prisma/client";
import { ArrowLeft, Loader2 } from "lucide-react";
import { memo, useState } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Separator } from "../ui/separator";
import ReinvestMonthlyButton from "./ReinvestMonthlyButton";
const formSchema = z.object({
  packageConnectionId: z.string(),
  packageId: z.string(),
  amountToReinvest: z.number(),
  type: z.enum(["14 days", "1 month", "3 months", "5 months"]),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  primaryPackage: package_table[];
  packageConnectionId: string;
  amountToReinvest: number;
};

const ReinvestButton = ({
  primaryPackage,
  packageConnectionId,
  amountToReinvest,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReinvestment, setSelectedReinvestment] = useState<{
    amount: number;
    bonus: number;
    months: number;
    type: "14 days" | "1 month" | "3 months" | "5 months";
    amountWithbonus: number;
    amountWithPercentage: number;
    percentage: number;
  } | null>(null);

  const { teamMemberProfile } = useRole();
  const { chartData, setChartData } = usePackageChartData();
  const { setAddTransactionHistory } = useUserTransactionHistoryStore();
  const { toast } = useToast();

  const {
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      packageConnectionId: packageConnectionId,
      packageId: "",
      amountToReinvest: amountToReinvest,
    },
  });

  const handleReinvest = async (data: FormValues) => {
    try {
      if (!selectedReinvestment) return;

      const selectedPackage = primaryPackage.find(
        (item) => item.package_id === data.packageId
      );

      const now = new Date();
      const completionDate = new Date(
        now.getTime() +
          (selectedPackage?.packages_days ?? 0) * 24 * 60 * 60 * 1000
      );

      await ReinvestPackageHandler({
        packageConnectionId: data.packageConnectionId,
        amountToReinvest: data.amountToReinvest,
        packageId: data.packageId,
        type: data.type,
      });

      const amountBonus =
        data.amountToReinvest *
        BONUS_MAPPING[data.type as keyof typeof BONUS_MAPPING];

      const finalAmount = amountToReinvest + amountBonus;

      setChartData([
        {
          package: selectedPackage?.package_name || "",
          completion: 0,
          completion_date: completionDate.toISOString(),
          amount: Number(finalAmount),
          is_ready_to_claim: false,
          package_connection_id: uuidv4(),
          profit_amount: Number(selectedReinvestment.amountWithPercentage),
          package_color: selectedPackage?.package_color || "",
          package_date_created: new Date().toISOString(),
          package_member_id: teamMemberProfile?.alliance_member_id,
          package_days: Number(selectedPackage?.packages_days || 0),
          current_amount: Number(finalAmount.toFixed(0)),
          currentPercentage: Number(0),
          package_percentage: Number(selectedPackage?.package_percentage || 0),
        },
        ...chartData.filter(
          (item) => item.package_connection_id !== data.packageConnectionId
        ),
      ]);

      setAddTransactionHistory({
        data: [
          {
            transaction_id: uuidv4(),
            transaction_date: new Date(),
            transaction_description: `Package Reinvested: ${selectedPackage?.package_name} + 1% Bonus`,
            transaction_details: "",
            transaction_member_id: teamMemberProfile?.alliance_member_id ?? "",
            transaction_amount: finalAmount,
            transaction_attachment: "",
          },
        ],
        count: 1,
      });

      setIsOpen(false);
      reset();

      toast({
        title: "Package Reinvested",
        description: `Package reinvested successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Error reinvesting package`,
      });
    }
  };

  const handleReinvestMonthly = (
    amount: number,
    bonus: number,
    months: number,
    type: "14 days" | "1 month" | "3 months" | "5 months",
    amountWithbonus: number,
    amountWithPercentage: number,
    percentage: number
  ) => {
    const packageMapping =
      REINVESTMENT_TYPE[type as keyof typeof REINVESTMENT_TYPE];
    setSelectedReinvestment({
      amount: amount,
      bonus: bonus,
      months: months,
      type: type,
      amountWithbonus: amountWithbonus,
      amountWithPercentage: amountWithPercentage,
      percentage: percentage,
    });
    setValue("type", type);
    setValue("packageId", packageMapping);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setSelectedReinvestment(null);
          reset();
        }
      }}
    >
      <DialogDescription></DialogDescription>
      <DialogTrigger asChild>
        <div className="relative inline-block">
          <Button className="dark:bg-amber-400  dark:text-black dark:hover:bg-amber-400/50 hover:bg-amber-400 hover:text-white cursor-pointer px-10 py-2 animate-tracing-border-2">
            Reinvest
          </Button>

          <span className="absolute -top-3 -left-3 text-xs font-extrabold text-white px-2 py-[2px] rounded-full bg-red-600 shadow-lg ring-2 ring-red-300 animate-bounce ring-offset-1">
            <span className=" inline-block">New!</span>
          </span>
        </div>
      </DialogTrigger>

      <DialogContent type="table" className="p-4">
        <DialogHeader>
          <DialogTitle className="text-bold text-center mb-4">
            NEW REINVEST SYSTEM
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-2" onSubmit={handleSubmit(handleReinvest)}>
          <div className="flex flex-col items-center justify-around space-y-2"></div>
          {/* amount to avail */}
          {!selectedReinvestment ? (
            <div className="flex flex-col sm:flex-row w-full gap-4 justify-center bg-pageColor rounded-lg text-white p-4">
              <ReinvestMonthlyButton
                amountToReinvest={amountToReinvest}
                percentage={70}
                bonus={0.5}
                months={0}
                type="14 days"
                handleReinvestMonthly={handleReinvestMonthly}
              />
              <ReinvestMonthlyButton
                amountToReinvest={amountToReinvest}
                percentage={140}
                bonus={1}
                months={1}
                type="1 month"
                handleReinvestMonthly={handleReinvestMonthly}
              />

              <ReinvestMonthlyButton
                amountToReinvest={amountToReinvest}
                percentage={420}
                bonus={3}
                months={3}
                type="3 months"
                handleReinvestMonthly={handleReinvestMonthly}
              />

              <ReinvestMonthlyButton
                amountToReinvest={amountToReinvest}
                percentage={700}
                bonus={5}
                months={5}
                type="5 months"
                handleReinvestMonthly={handleReinvestMonthly}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                disabled={isSubmitting}
                type="button"
                size="sm"
                variant="card"
                onClick={() => setSelectedReinvestment(null)}
                className="rounded-md absolute top-4 left-4"
              >
                <ArrowLeft /> Back
              </Button>
              <div className="flex justify-between gap-2">
                <p className="text-center text-lg font-bold">
                  Reinvestment Amount
                </p>
                <p>
                  ₱{" "}
                  {amountToReinvest.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="flex justify-between gap-2">
                <p className="text-center text-lg font-bold">
                  Bonus {selectedReinvestment.bonus}%
                </p>
                <p>
                  ₱{" "}
                  {selectedReinvestment.amountWithbonus.toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </p>
              </div>

              <div className="flex justify-between gap-2">
                <p className="text-center text-lg font-bold">
                  Profit {selectedReinvestment.percentage}%
                </p>
                <p>
                  ₱{" "}
                  {selectedReinvestment.amountWithPercentage.toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </p>
              </div>
              <Separator />
              <div className="flex justify-between gap-2 mb-4">
                <p className="text-center text-xl font-extrabold">Total</p>
                <p className="text-xl font-extrabold">
                  ₱{" "}
                  {selectedReinvestment.amount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              <Button
                disabled={isSubmitting}
                type="submit"
                className="w-full rounded-md bg-amber-400 text-black hover:bg-amber-400/50 animate-tracing-border-2"
                variant="card"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {"Reinvesting ..."}
                  </>
                ) : (
                  "Reinvest"
                )}
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default memo(ReinvestButton);
