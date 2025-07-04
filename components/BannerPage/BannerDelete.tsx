import { company_promo_table } from "@/utils/types";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

type BannerEditProps = {
  banner: company_promo_table;
  onSubmit: (banner: company_promo_table) => void;
};

const BannerDelete = ({ onSubmit, banner }: BannerEditProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    onSubmit(banner);
    setIsOpen(false);
  };
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setIsOpen(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="absolute top-5 right-5 bg-red-500 z-50" size="icon">
          <XIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Delete Banner</DialogTitle>
          <DialogDescription className="text-white">
            Are you sure you want to delete this banner?
          </DialogDescription>
        </DialogHeader>
        <Button onClick={handleDelete}>Delete</Button>
      </DialogContent>
    </Dialog>
  );
};

export default BannerDelete;
