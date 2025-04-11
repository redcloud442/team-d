"use client";

import { deleteRaffleBanner } from "@/services/Raffle/Admin";
import { alliance_promo_banner_table } from "@prisma/client";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import AdminCreateBanner from "./AdminCreateBanner";

type AdminBannerPageProps = {
  banner: alliance_promo_banner_table[];
};

const AdminBannerPage = ({ banner: initialBanner }: AdminBannerPageProps) => {
  const [banner, setBanner] = useState(initialBanner);
  const [selectedBannerId, setSelectedBannerId] = useState<string | null>(null);

  const handleDeleteBanner = async (bannerId: string) => {
    await deleteRaffleBanner({ bannerId });
    setBanner((prev) =>
      prev.filter((b) => b.alliance_promo_banner_id !== bannerId)
    );
    setSelectedBannerId(null);
  };

  return (
    <div className="container mx-auto p-4 md:p-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="Title">List of Banner</h1>
        <AdminCreateBanner setBanner={setBanner} />
      </div>

      <div className="flex flex-wrap gap-10">
        {banner.map((b) => (
          <Dialog key={b.alliance_promo_banner_id}>
            <DialogTrigger asChild>
              <div
                className="relative group cursor-pointer"
                onClick={() => setSelectedBannerId(b.alliance_promo_banner_id)}
              >
                <Image
                  src={b.alliance_promo_banner_image}
                  alt={`Banner ${b.alliance_promo_banner_id}`}
                  width={500}
                  height={300}
                  className="w-full max-w-sm h-auto object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center items-center rounded-lg font-bold text-red-500 text-2xl">
                  <Trash2 className="text-white w-6 h-6" />
                </div>
              </div>
            </DialogTrigger>

            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the
                  banner from the database.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-4 mt-4">
                <DialogClose asChild>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (selectedBannerId) {
                        handleDeleteBanner(selectedBannerId);
                      }
                    }}
                  >
                    Delete Banner
                  </Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
};

export default AdminBannerPage;
