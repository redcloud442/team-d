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
import { useToast } from "@/hooks/use-toast";
import { logError } from "@/services/Error/ErrorLogs";
import { updatePackagesData } from "@/services/Package/Admin";
import { escapeFormData } from "@/utils/function";
import { createClientSide } from "@/utils/supabase/client";

import { zodResolver } from "@hookform/resolvers/zod";
import { alliance_member_table, package_table } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
  teamMemberProfile: alliance_member_table;
  selectedPackage: package_table | null;
  handleSelectPackage: () => void;
  fetchPackages: () => void;
};

const PackagesSchema = z.object({
  packageName: z.string().min(1, "Package name is required"),
  packageDescription: z.string().min(1, "Package description is required"),
  packagePercentage: z.string().refine((value) => Number(value) > 0, {
    message: "Percentage must be greater than 0",
  }),
  packageDays: z.string().refine((value) => Number(value) > 0, {
    message: "Days must be greater than 0",
  }),
});

export type PackagesFormValues = z.infer<typeof PackagesSchema>;

const EditPackagesModal = ({
  teamMemberProfile,
  selectedPackage,
  handleSelectPackage,
  fetchPackages,
}: Props) => {
  const supabaseClient = createClientSide();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PackagesFormValues>({
    resolver: zodResolver(PackagesSchema),
    defaultValues: {
      packageName: "",
      packageDescription: "",
      packagePercentage: "",
      packageDays: "",
    },
  });

  useEffect(() => {
    if (selectedPackage) {
      reset({
        packageName: selectedPackage.package_name,
        packageDescription: selectedPackage.package_description,
        packagePercentage: selectedPackage.package_percentage.toString(),
        packageDays: selectedPackage.packages_days.toString(),
      });
    }
  }, [selectedPackage, reset]);

  const onSubmit = async (data: PackagesFormValues) => {
    try {
      const sanitizedData = escapeFormData(data);
      await updatePackagesData({
        packageData: sanitizedData,
        teamMemberId: teamMemberProfile.alliance_member_id,
        packageId: selectedPackage?.package_id ?? "",
      });
      toast({
        title: "Package Updated Successfully",
        description: "Please wait",
        variant: "success",
      });
      setOpen(false);
      reset();

      fetchPackages();
    } catch (e) {
      if (e instanceof Error) {
        await logError(supabaseClient, {
          errorMessage: e.message,
          stackTrace: e.stack,
          stackPath: "components/AdminPackagesPage/EditPackagesModal.tsx",
        });
      }
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => (isOpen ? setOpen(true) : handleClose())}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          onClick={() => {
            setOpen(true);
            handleSelectPackage();
          }}
        >
          Update Package
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Package</DialogTitle>
          <DialogDescription>
            Update the package details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Package Name */}
          <div>
            <Label htmlFor="packageName">Package Name</Label>
            <Controller
              name="packageName"
              control={control}
              render={({ field }) => (
                <Input
                  id="packageName"
                  placeholder="Enter package name"
                  {...field}
                />
              )}
            />
            {errors.packageName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.packageName.message}
              </p>
            )}
          </div>

          {/* Package Description */}
          <div>
            <Label htmlFor="packageDescription">Package Description</Label>
            <Controller
              name="packageDescription"
              control={control}
              render={({ field }) => (
                <Input
                  id="packageDescription"
                  placeholder="Enter package description"
                  {...field}
                />
              )}
            />
            {errors.packageDescription && (
              <p className="text-red-500 text-sm mt-1">
                {errors.packageDescription.message}
              </p>
            )}
          </div>

          {/* Package Percentage */}
          <div>
            <Label htmlFor="packagePercentage">Package Percentage</Label>
            <Controller
              name="packagePercentage"
              control={control}
              render={({ field }) => (
                <Input
                  id="packagePercentage"
                  type="number"
                  placeholder="Enter package percentage"
                  min="1"
                  {...field}
                />
              )}
            />
            {errors.packagePercentage && (
              <p className="text-red-500 text-sm mt-1">
                {errors.packagePercentage.message}
              </p>
            )}
          </div>

          {/* Package Days */}
          <div>
            <Label htmlFor="packageDays">Package Days</Label>
            <Controller
              name="packageDays"
              control={control}
              render={({ field }) => (
                <Input
                  id="packageDays"
                  type="number"
                  placeholder="Enter package days"
                  min="1"
                  {...field}
                />
              )}
            />
            {errors.packageDays && (
              <p className="text-red-500 text-sm mt-1">
                {errors.packageDays.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin mr-2" />} Submit
          </Button>
        </form>
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPackagesModal;
