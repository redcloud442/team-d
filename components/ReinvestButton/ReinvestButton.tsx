import { useToast } from "@/hooks/use-toast";
import { ReinvestPackageHandler } from "@/services/Package/Member";
import { usePackageChartData } from "@/store/usePackageChartData";
import { useUserTransactionHistoryStore } from "@/store/useTransactionStore";
import { useRole } from "@/utils/context/roleContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { package_table } from "@prisma/client";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
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

  const computationMaturity = (amount: number) => {
    return amount * (primaryPackage?.package_percentage ?? 0) * 0.01 * 2;
  };

  const sumOfTotal = (amount: number) => {
    return (
      amount * (primaryPackage?.package_percentage ?? 0) * 0.01 * 2 + amount
    );
  };

  const reinvestmentAmount = (amount: number) => {
    return amount * (primaryPackage?.package_percentage ?? 0) * 0.01 + amount;
  };

  const reinvestmentMaturity = (amount: number) => {
    return amount * (primaryPackage?.package_percentage ?? 0) * 0.01;
  };

  const {
    handleSubmit,
    control,
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
          profit_amount: Number(reinvestmentMaturity(data.amountToReinvest)),
          package_color: primaryPackage?.package_color || "",
          package_date_created: new Date().toISOString(),
          package_member_id: teamMemberProfile?.alliance_member_id,
          package_days: Number(primaryPackage?.packages_days || 0),
          current_amount: Number(data.amountToReinvest.toFixed(0)),
          currentPercentage: Number(0),
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
            transaction_amount: reinvestmentAmount(data.amountToReinvest),
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
        <Button className="dark:bg-amber-400 dark:text-black dark:hover:bg-amber-400/50 hover:bg-amber-400 hover:text-white cursor-pointer px-10 py-2">
          Reinvest
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-bold mb-4">Reinvest Package</DialogTitle>
        </DialogHeader>

        <form className="space-y-2" onSubmit={handleSubmit(handleReinvest)}>
          <div className="flex flex-col items-center justify-around space-y-2">
            <Card
              style={{
                background: `linear-gradient(110deg, ${primaryPackage.package_color || "#F6DB4E"} 60%, #ED9738)`,
              }}
              className={`w-full rounded-lg cursor-pointer shadow-lg  flex flex-col items-center justify-center space-y-4 relative overflow-hidden`}
            >
              {/* Responsive Image */}
              {primaryPackage.package_image && (
                <div className="w-full relative">
                  <Image
                    src={primaryPackage.package_image}
                    alt={`${primaryPackage.package_name} image`}
                    width={400}
                    height={300}
                    style={{ objectFit: "cover" }}
                    className="rounded-lg"
                  />
                </div>
              )}
            </Card>
          </div>
          {/* amount to avail */}
          <div className="flex gap-2 w-full">
            <div className="w-full">
              <label className="font-bold text-center" htmlFor="amount">
                Amount to reinvest
              </label>
              <Controller
                name="amountToReinvest"
                control={control}
                render={({ field }) => (
                  <Input
                    id="amountToReinvest"
                    type="text"
                    placeholder="Enter amount"
                    {...field}
                    className="w-full border border-gray-300 text-center rounded-lg shadow-xs px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                    value={field.value || ""}
                    readOnly
                  />
                )}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="font-bold" htmlFor="Maturity">
              Maturity Income After 1 month
            </label>
            <Input
              variant="default"
              id="Maturity"
              readOnly
              type="text"
              className="text-center"
              placeholder="Enter amount"
              value={
                computationMaturity(amountToReinvest).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) || ""
              }
            />
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="font-bold" htmlFor="Gross">
              Total Gross
            </label>
            <Input
              variant="default"
              id="Gross"
              readOnly
              type="text"
              className="text-center"
              placeholder="Gross Income"
              value={
                sumOfTotal(amountToReinvest).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) || ""
              }
            />
          </div>

          <Button
            disabled={isSubmitting}
            type="submit"
            className="w-full rounded-md bg-amber-400 text-black hover:bg-amber-400/50"
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
