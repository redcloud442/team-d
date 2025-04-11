"use client";

import { createClientSide } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

type Promo = {
  alliance_promo_id: string;
  alliance_promo_title: string;
  alliance_promo_description: string;
  alliance_promo_current_slot: number;
  alliance_promo_maximum_slot: number;
  alliance_promo_image: string | null;
  alliance_promo_is_active: boolean;
  alliance_promo_date: string;
};

const DashboardRaffle = () => {
  const supabase = createClientSide();
  const [promos, setPromos] = useState<Promo[]>([]);

  useEffect(() => {
    const fetchPromos = async () => {
      const { data } = await supabase
        .schema("alliance_schema")
        .from("alliance_promo_table")
        .select("*")
        .eq("alliance_promo_is_disabled", false)
        .order("alliance_promo_date", { ascending: false });

      if (data) setPromos(data);
    };

    fetchPromos();

    const channel = supabase
      .channel("realtime-promos")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "alliance_schema",
          table: "alliance_promo_table",
        },
        (payload) => {
          fetchPromos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div
        className={`grid grid-cols-1 ${
          promos.length === 1
            ? "sm:grid-cols-1"
            : promos.length === 2
              ? "sm:grid-cols-2"
              : "sm:grid-cols-3"
        } gap-6 items-center justify-center`}
      >
        {promos.map((promo) => (
          <div
            key={promo.alliance_promo_id}
            className="bg-cardColor rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-5 border border-gray-100 text-center space-y-4 animate-tracing-border"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-2 ani">
              {promo.alliance_promo_title}
            </h3>
            <p className="text-gray-600 text-lg mb-4 text-balance">
              {promo.alliance_promo_description}
            </p>
            <div className="flex justify-center items-center text-xl text-gray-500">
              <span>
                Slots:{" "}
                <span className="font-semibold text-gray-800">
                  {promo.alliance_promo_current_slot}/
                  {promo.alliance_promo_maximum_slot}
                </span>
              </span>
            </div>
            <span className="font-semibold text-gray-800">
              Slots:{" "}
              {promo.alliance_promo_maximum_slot -
                promo.alliance_promo_current_slot}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardRaffle;
