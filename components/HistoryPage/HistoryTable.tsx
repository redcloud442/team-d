"use client";

import { logError } from "@/services/Error/ErrorLogs";
import { getTransactionHistory } from "@/services/Transaction/Transaction";
import { useRole } from "@/utils/context/roleContext";
import { createClientSide } from "@/utils/supabase/client";
import { TransactionHistoryData } from "@/utils/types";
import { useEffect, useState } from "react";
import HistoryCardList from "./HistoryCardList";

type Props = {
  type: "withdrawal" | "deposit" | "earnings" | "referral";
};

const HistoryTable = ({ type }: Props) => {
  const supabaseClient = createClientSide();
  const { teamMemberProfile } = useRole();

  const [requestData, setRequestData] = useState<TransactionHistoryData | null>(
    null
  );
  const [activePage, setActivePage] = useState(1);
  const [isFetchingList, setIsFetchingList] = useState(false);

  const statusKey = type.toUpperCase() as
    | "EARNINGS"
    | "WITHDRAWAL"
    | "DEPOSIT"
    | "REFERRAL";

  const fetchRequest = async () => {
    try {
      if (!teamMemberProfile) return;

      setIsFetchingList(true);

      const { transactionHistory, totalTransactions } =
        await getTransactionHistory({
          page: activePage,
          status: statusKey,
          limit: 10,
        });

      setRequestData((prev) => {
        const initialData = prev?.data ?? {
          EARNINGS: { data: [], count: 0 },
          WITHDRAWAL: { data: [], count: 0 },
          DEPOSIT: { data: [], count: 0 },
          REFERRAL: { data: [], count: 0 },
        };

        const merged = [
          ...(activePage > 1 ? (initialData?.[statusKey]?.data ?? []) : []),
          ...transactionHistory,
        ];

        return {
          data: {
            ...initialData,
            [statusKey]: {
              data: merged,
              count: totalTransactions,
            },
          },
        };
      });
    } catch (e) {
      if (e instanceof Error) {
        await logError(supabaseClient, {
          errorMessage: e.message,
          stackTrace: e.stack,
          stackPath:
            "components/TransactionHistoryPage/TransactionHistoryTable.tsx",
        });
      }
    } finally {
      setIsFetchingList(false);
    }
  };

  useEffect(() => {
    if (!teamMemberProfile) return;
    fetchRequest();
  }, [teamMemberProfile, activePage]);

  const handleLoadMore = async () => {
    setActivePage((prev) => prev + 1);
  };

  return (
    <HistoryCardList
      data={requestData?.data?.[statusKey]?.data || []}
      count={requestData?.data?.[statusKey]?.count || 0}
      isLoading={isFetchingList}
      onLoadMore={handleLoadMore}
      currentStatus={statusKey}
    />
  );
};

export default HistoryTable;
