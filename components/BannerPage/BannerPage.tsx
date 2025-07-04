"use client";

import { GetBanners } from "@/services/Banner/Banner";
import { createClientSide } from "@/utils/supabase/client";
import { company_promo_table } from "@/utils/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import BannerDelete from "./BannerDelete";
import BannerEdit from "./BannerEdit";
import { BannerForm } from "./BannerForm";

const BannerPage = () => {
  const supabaseClient = createClientSide();
  const queryClient = useQueryClient();

  const { data: banners } = useQuery({
    queryKey: ["banners"],
    queryFn: GetBanners,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  const [editingBanner, setEditingBanner] =
    useState<company_promo_table | null>(null);

  const [isOpen, setIsOpen] = useState(false);

  const createOrUpdateBanner = useMutation({
    mutationFn: async ({
      data,
      editingBanner,
    }: {
      data: Partial<{ company_promo_image: File | string }>;
      editingBanner: company_promo_table | null;
    }) => {
      if (!data.company_promo_image) throw new Error("No file provided");

      // 1️⃣ Upload to Supabase Storage (skip if it’s already a URL string)
      let publicUrl = data.company_promo_image as string;

      if (data.company_promo_image instanceof File) {
        const file = data.company_promo_image;
        const filePath = `uploads/${Date.now()}_${file.name}`;

        const { error } = await supabaseClient.storage
          .from("BANNER_IMAGES")
          .upload(filePath, file, { upsert: true });
        if (error) throw error;

        publicUrl = `${process.env.NODE_ENV === "development" ? process.env.NEXT_PUBLIC_SUPABASE_URL : "https://cdn.digi-wealth.vip"}/storage/v1/object/public/BANNER_IMAGES/${filePath}`;
      }

      // 2️⃣ Hit the banner API
      const endpoint = editingBanner
        ? `/api/v1/banner/${editingBanner.company_promo_id}`
        : "/api/v1/banner";
      const method = editingBanner ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_promo_image: publicUrl }),
      });
      if (!res.ok) throw new Error("Unable to save banner");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });

  const { mutate: deleteBanner } = useMutation({
    onMutate: (banner) => {
      const queryData = queryClient.getQueryData(["banners"]);
      queryClient.setQueryData(["banners"], (old: company_promo_table[]) =>
        old?.filter((b) => b.company_promo_id !== banner.company_promo_id)
      );

      return { queryData };
    },
    mutationFn: (banner: company_promo_table) => {
      return handleDeleteBanner(banner);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
    onError: (error, data, context) => {
      if (context?.queryData) {
        queryClient.setQueryData(["banners"], context?.queryData);
      }
    },
    onSettled: () => {
      setIsOpen(false);
    },
  });

  const handleSubmit = (
    data: Partial<{ company_promo_image: File | string }>
  ) => createOrUpdateBanner.mutate({ data, editingBanner });

  const handleDeleteBanner = async (banner: company_promo_table) => {
    await fetch(`/api/v1/banner/${banner.company_promo_id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
  };

  const handleSelectBanner = (banner: company_promo_table) => {
    setEditingBanner(banner);
    setIsOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Banner Management</h1>

      <BannerForm
        initialData={undefined}
        onSubmit={handleSubmit}
        isLoading={createOrUpdateBanner.isPending}
      />

      <hr />

      <h2 className="text-xl font-semibold">Banner List</h2>
      <ul className="space-y-4 flex gap-4">
        {banners?.map((banner) => (
          <li key={banner.company_promo_id} className="space-y-4 relative">
            <Image
              src={banner.company_promo_image}
              alt={banner.company_promo_id}
              width={500}
              height={500}
            />
            <BannerEdit
              isLoading={createOrUpdateBanner.isPending}
              banner={banner}
              onSubmit={handleSubmit}
              isOpen={isOpen}
              editingBanner={editingBanner}
              handleSelectBanner={handleSelectBanner}
              setIsOpen={setIsOpen}
            />
            <BannerDelete banner={banner} onSubmit={deleteBanner} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BannerPage;
