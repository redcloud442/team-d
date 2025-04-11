"use client";

import { toast } from "@/hooks/use-toast";
import { createRaffleBanner } from "@/services/Raffle/Admin";
import { createClientSide } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { alliance_promo_banner_table } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import FileUpload from "../ui/dropZone"; // make sure this exists
const BannerSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => !!file, { message: "File is required" })
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/jpg"].includes(file.type) &&
        file.size <= 12 * 1024 * 1024, // 12MB limit
      { message: "File must be a valid image and less than 12MB." }
    )
    .optional(),
});

type BannerFormValues = z.infer<typeof BannerSchema>;

type Props = {
  setBanner: Dispatch<SetStateAction<alliance_promo_banner_table[]>>;
};

const AdminCreateBanner = ({ setBanner }: Props) => {
  const supabaseClient = createClientSide();
  const { handleSubmit, control, formState, reset, watch } =
    useForm<BannerFormValues>({
      resolver: zodResolver(BannerSchema),
    });

  const handleUploadBanner = async (data: BannerFormValues) => {
    try {
      const file = data.file;
      let attachmentUrl = null;

      if (file) {
        const filePath = `uploads/${Date.now()}_${file.name}`;

        const { error: uploadError } = await supabaseClient.storage
          .from("TESTIMONIAL_BUCKET")
          .upload(filePath, file, { upsert: true });

        if (uploadError) {
          toast({
            title: "Error",
            description: "An error occurred while uploading the file.",
            variant: "destructive",
          });
          return;
        }

        attachmentUrl =
          process.env.NODE_ENV === "development"
            ? "https://qkrltxqicdallokpzdif.supabase.co/storage/v1/object/public/TESTIMONIAL_BUCKET/" +
              filePath
            : "https://cdn.primepinas.com/storage/v1/object/public/TESTIMONIAL_BUCKET/" +
              filePath;
      }

      const newBanner = await createRaffleBanner({
        bannerImage: attachmentUrl ? attachmentUrl : "",
      });

      setBanner((prev) => [
        ...prev,
        newBanner as unknown as alliance_promo_banner_table,
      ]);

      reset();
      toast({
        title: "Banner Created",
        description: "Banner has been created successfully",
      });

      //   setRequestData((prev) => [...prev, merchantData]);
      //   setIsOpenModal(false);
    } catch (e) {
      toast({
        title: "Error",
        description: "An error occurred while creating the merchant.",
        variant: "destructive",
      });
    }
  };

  const uploadedFile = watch("file");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create Banner</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Banner</DialogTitle>
        </DialogHeader>

        <form
          className="flex flex-col gap-6 w-full max-w-4xl rounded-md"
          onSubmit={handleSubmit(handleUploadBanner)}
        >
          {/* File Upload */}
          <div>
            <Controller
              name="file"
              control={control}
              render={({ field }) => (
                <FileUpload
                  label="Upload QR"
                  onFileChange={(file) => field.onChange(file)}
                />
              )}
            />
            {uploadedFile && !formState.errors.file && (
              <p className="text-md font-bold text-green-700">
                {"File Uploaded Successfully"}
              </p>
            )}

            {formState.errors.file && (
              <p className="text-primaryRed text-sm mt-1">
                {formState.errors.file?.message}
              </p>
            )}
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="flex flex-col gap-2 mt-4">
            <Button
              disabled={formState.isSubmitting}
              type="submit"
              className="w-full rounded-md"
              variant="card"
            >
              {formState.isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" /> Uploading...
                </div>
              ) : (
                "Create"
              )}
            </Button>
            <DialogClose asChild>
              <Button
                type="button"
                className="w-full rounded-md dark:border-black border-2"
              >
                Cancel
              </Button>
            </DialogClose>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminCreateBanner;
