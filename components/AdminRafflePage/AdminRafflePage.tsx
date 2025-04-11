"use client";

import { logError } from "@/services/Error/ErrorLogs";
import { getAdminRaffle } from "@/services/Raffle/Admin";
import { useRole } from "@/utils/context/roleContext";
import { createClientSide } from "@/utils/supabase/client";
import { alliance_promo_table } from "@prisma/client";
import { useEffect, useState } from "react";
import CreateRaffleModal from "./CreateRaffleModal";
import UpdateRaffleModal from "./UpdateRaffleModal";
const AdminPackageList = () => {
  const supabase = createClientSide();
  const { teamMemberProfile } = useRole();
  const [raffle, setRaffle] = useState<alliance_promo_table[]>([]);

  const fetchRaffle = async () => {
    try {
      if (!teamMemberProfile) return;

      const fetchedRaffle = await getAdminRaffle();

      setRaffle(fetchedRaffle);
    } catch (e) {
      if (e instanceof Error) {
        await logError(supabase, {
          errorMessage: e.message,
          stackTrace: e.stack,
          stackPath: "components/AdminPackagesPage/AdminPackagesPage.tsx",
        });
      }
    }
  };

  useEffect(() => {
    fetchRaffle();
  }, [teamMemberProfile, supabase]);

  return (
    <div className="container mx-auto p- md:p-10 space-y-6 ">
      <div className="flex justify-between items-center">
        <h1 className="Title">List of Promo</h1>
        <CreateRaffleModal setRaffle={setRaffle} />
      </div>
      <div className="space-y-4">
        <div
          className={`grid grid-cols-1 ${
            raffle.length === 1
              ? "sm:grid-cols-1"
              : raffle.length === 2
                ? "sm:grid-cols-2"
                : "sm:grid-cols-3"
          } gap-6 items-center justify-center`}
        >
          {raffle.map((raffle) => (
            <div
              key={raffle.alliance_promo_id}
              className="bg-cardColor rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-5 border border-gray-100 text-center space-y-4 animate-tracing-border h-full"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-2 ani">
                {raffle.alliance_promo_title}
              </h3>
              <p className="text-gray-600 text-lg mb-4 text-balance">
                {raffle.alliance_promo_description}
              </p>
              <div className="flex justify-center items-center text-xl text-gray-500">
                <span>
                  Slots:{" "}
                  <span className="font-semibold text-gray-800">
                    {raffle.alliance_promo_current_slot}/
                    {raffle.alliance_promo_maximum_slot}
                  </span>
                </span>
              </div>
              <div className="flex flex-col justify-center items-center gap-4">
                <span className="font-semibold text-gray-800">
                  Slots:{" "}
                  {raffle.alliance_promo_maximum_slot -
                    raffle.alliance_promo_current_slot}
                </span>

                <UpdateRaffleModal setRaffle={setRaffle} raffle={raffle} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPackageList;
