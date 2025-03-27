import { useToast } from "@/hooks/use-toast";
import { ReinvestPackageHandler } from "@/services/Package/Member";
import { usePackageChartData } from "@/store/usePackageChartData";
import { useUserTransactionHistoryStore } from "@/store/useTransactionStore";
import { useRole } from "@/utils/context/roleContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { package_table } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
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
import { Input } from "../ui/input";

const formSchema = z.object({
  packageConnectionId: z.string(),
  packageId: z.string(),
  amountToReinvest: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  primaryPackage: package_table;
  packageConnectionId: string;
  amountToReinvest: number;
};

const ReinvestButton = ({
  primaryPackage,
  packageConnectionId,
  amountToReinvest,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const { teamMemberProfile } = useRole();
  const { chartData, setChartData } = usePackageChartData();
  const { setAddTransactionHistory } = useUserTransactionHistoryStore();
  const { toast } = useToast();

  const reinvestmentAmount = useMemo(() => {
    return amountToReinvest * (primaryPackage?.package_percentage ?? 0) * 0.01;
  }, [primaryPackage]);

  const reinvestmentMaturity = useMemo(() => {
    return amountToReinvest * (primaryPackage?.package_percentage ?? 0) * 0.01;
  }, [primaryPackage, amountToReinvest]);

  const maturityIncome = useMemo(() => {
    return (
      amountToReinvest * (primaryPackage?.package_percentage ?? 0) * 0.01 +
      amountToReinvest
    );
  }, [primaryPackage, amountToReinvest]);

  const sumOfTotal = useMemo(() => {
    return (
      maturityIncome * (primaryPackage?.package_percentage ?? 0) * 0.01 +
      maturityIncome
    );
  }, [primaryPackage, amountToReinvest]);

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      packageConnectionId: packageConnectionId,
      packageId: primaryPackage.package_id ?? "",
      amountToReinvest: amountToReinvest,
    },
  });

  const handleReinvest = async (data: FormValues) => {
    try {
      const now = new Date();
      const completionDate = new Date(
        now.getTime() +
          (primaryPackage?.packages_days ?? 0) * 24 * 60 * 60 * 1000
      );

      await ReinvestPackageHandler({
        packageConnectionId: data.packageConnectionId,
        amountToReinvest: data.amountToReinvest,
        packageId: data.packageId,
      });

      setChartData([
        {
          package: primaryPackage?.package_name || "",
          completion: 0,
          completion_date: completionDate.toISOString(),
          amount: Number(data.amountToReinvest),
          is_ready_to_claim: false,
          package_connection_id: uuidv4(),
          profit_amount: Number(reinvestmentMaturity),
          package_color: primaryPackage?.package_color || "",
          package_date_created: new Date().toISOString(),
          package_member_id: teamMemberProfile?.alliance_member_id,
          package_days: Number(primaryPackage?.packages_days || 0),
          current_amount: Number(data.amountToReinvest.toFixed(0)),
          currentPercentage: Number(0),
          package_percentage: Number(primaryPackage?.package_percentage || 0),
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
            transaction_description: `Package Reinvested: ${primaryPackage?.package_name}`,
            transaction_details: "",
            transaction_member_id: teamMemberProfile?.alliance_member_id ?? "",
            transaction_amount: reinvestmentAmount,
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogDescription></DialogDescription>
      <DialogTrigger asChild>
        <Button className="dark:bg-amber-400 dark:text-black dark:hover:bg-amber-400/50 hover:bg-amber-400 hover:text-white cursor-pointer px-10 py-2 animate-tracing-border-2">
          Reinvest
        </Button>
      </DialogTrigger>
      <DialogContent type="earnings">
        <DialogHeader>
          <DialogTitle className="text-bold mb-4">REINVEST</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center font-bold text-lg sm:text-xl">
          <p className="text-center">Click &quot;Reinvest&quot; Now!</p>
          <p className="text-center">
            Your ₱
            {amountToReinvest.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            will become ₱
            {sumOfTotal.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-center"> in 1 month if you roll it back.</p>
        </div>
        <form className="space-y-2" onSubmit={handleSubmit(handleReinvest)}>
          <div className="flex flex-col items-center justify-around space-y-2"></div>
          {/* amount to avail */}
          <div className="flex gap-2 w-full items-end justify-center bg-pageColor rounded-lg text-white p-1">
            <div className="w-full flex flex-col items-center justify-center">
              <label
                className="text-[10px] sm:text-xs text-center"
                htmlFor="amount"
              >
                TOTAL REINVESTED
              </label>

              <Input
                id="totalReinvested"
                type="text"
                placeholder="Enter amount"
                className="w-full text-center rounded-lg shadow-xs border-none px-4 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-sm sm:text-sm p-0"
                readOnly
                value={amountToReinvest.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              />
            </div>
            <div className="w-full flex flex-col items-center justify-center">
              <label
                className="text-[10px] sm:text-xs text-center "
                htmlFor="amount"
              >
                PROFIT
              </label>
              <Input
                variant="default"
                id="Maturity"
                readOnly
                type="text"
                className="text-center border-none text-sm md:text-sm sm:text-sm p-0"
                placeholder="Enter amount"
                value={reinvestmentAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              />
            </div>
            <div className="w-full flex flex-col items-center justify-center">
              <label
                className="text-[10px] sm:text-xs text-center "
                htmlFor="amount"
              >
                TOTAL INCOME
              </label>

              <Input
                id="amountToReinvest"
                type="text"
                placeholder="Enter amount"
                className="w-full text-center rounded-lg shadow-xs px-4 py-2 border-none focus:ring-blue-500 focus:border-blue-500 text-sm md:text-sm sm:text-sm p-0"
                value={
                  maturityIncome.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || ""
                }
                readOnly
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label
              className="text-3xl text-center font-extrabold"
              htmlFor="Gross"
            >
              1 Month Income
            </label>
            <Input
              variant="default"
              id="Gross"
              readOnly
              type="text"
              className="text-center text-2xl md:text-2xl sm:text-2xl font-extrabold"
              placeholder="Gross Income"
              value={sumOfTotal.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            />
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
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReinvestButton;
