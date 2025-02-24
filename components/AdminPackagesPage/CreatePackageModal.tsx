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
import { createPackage } from "@/services/Package/Admin";
import { escapeFormData } from "@/utils/function";
import { createClientSide } from "@/utils/supabase/client";

import { zodResolver } from "@hookform/resolvers/zod";
import { package_table } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import FileUpload from "../ui/dropZone";

type Props = {
  setPackages: Dispatch<SetStateAction<package_table[]>>;
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
  packageColor: z.string().optional(),
  file: z
    .instanceof(File)
    .refine((file) => !!file, { message: "File is required" })
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/jpg"].includes(file.type) &&
        file.size <= 12 * 1024 * 1024, // 12MB limit
      { message: "File must be a valid image and less than 12MB." }
    ),
});

export type PackagesFormValues = z.infer<typeof PackagesSchema>;

const CreatePackageModal = ({ setPackages }: Props) => {
  const supabaseClient = createClientSide();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    reset,
    watch,
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

  const uploadedFile = watch("file");

  const onSubmit = async (data: PackagesFormValues) => {
    try {
      const sanitizedData = escapeFormData(data);

      const file = data.file;

      const filePath = `uploads/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("PACKAGE_IMAGES")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        return toast({
          title: "Error",
          description: "File upload failed.",
          variant: "destructive",
        });
      }

      const publicUrl =
        "https://cdn.primepinas.com/storage/v1/object/public/PACKAGE_IMAGES/" +
        filePath;

      const response = await createPackage({
        packageName: sanitizedData.packageName,
        packageDescription: sanitizedData.packageDescription,
        packagePercentage: sanitizedData.packagePercentage,
        packageDays: sanitizedData.packageDays,
        packageImage: publicUrl,
        packageColor: sanitizedData.packageColor || "",
      });

      setPackages((prev) => [...prev, response]);

      toast({
        title: "Package Created Successfully",
        description: "Please wait",
      });
      setOpen(false);
      reset();
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
          }}
        >
          Create Package
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Package</DialogTitle>
          <DialogDescription></DialogDescription>
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

          <div>
            <Label htmlFor="packageColor">Package Color</Label>
            <Controller
              name="packageColor"
              control={control}
              render={({ field }) => (
                <Input
                  id="packageColor"
                  className="w-full py-0"
                  type="color"
                  {...field}
                />
              )}
            />
            {errors.packageColor && (
              <p className="text-red-500 text-sm mt-1">
                {errors.packageColor.message}
              </p>
            )}
          </div>

          <div>
            <Controller
              name="file"
              control={control}
              render={({ field }) => (
                <FileUpload
                  label="Upload Package Image"
                  onFileChange={(file) => field.onChange(file)}
                />
              )}
            />
            {!errors.file && uploadedFile && (
              <p className="text-md font-bold text-green-700">
                {"File Uploaded Successfully"}
              </p>
            )}
            {errors.file && (
              <p className="text-primaryRed text-sm mt-1">
                {errors.file?.message}
              </p>
            )}
          </div>

          <div className="flex justify-center items-center">
            <Button
              type="submit"
              className="w-full"
              variant="card"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="animate-spin mr-2" />} Submit
            </Button>
          </div>
        </form>
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePackageModal;
