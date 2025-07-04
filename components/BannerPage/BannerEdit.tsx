import { company_promo_table } from "@/utils/types";
import { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { BannerForm } from "./BannerForm";

type BannerEditProps = {
  banner: company_promo_table;
  onSubmit: (data: Partial<{ company_promo_image: File | string }>) => void;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  editingBanner: company_promo_table | null;
  handleSelectBanner: (banner: company_promo_table) => void;
  isLoading: boolean;
};

const BannerEdit = ({
  onSubmit,
  isOpen,
  editingBanner,
  handleSelectBanner,
  setIsOpen,
  banner,
  isLoading,
}: BannerEditProps) => {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        handleSelectBanner(banner);

        if (!open) {
          setIsOpen(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-full">Edit</Button>
      </DialogTrigger>
      <DialogContent className="text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Banner</DialogTitle>
          <DialogDescription className="text-white">
            Edit the banner image and other details.
          </DialogDescription>
        </DialogHeader>
        <BannerForm
          isLoading={isLoading}
          initialData={editingBanner || undefined}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BannerEdit;
