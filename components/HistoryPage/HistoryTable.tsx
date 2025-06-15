"use client";

import { getTransactionHistory } from "@/services/Transaction/Transaction";
import { useRole } from "@/utils/context/roleContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import HistoryCardList from "./HistoryCardList";

type Props = {
  type: "withdrawal" | "deposit" | "earnings" | "referral";
  isBackHidden?: boolean;
};

const PAGE_LIMIT = 10;

const HistoryTable = ({ type, isBackHidden = false }: Props) => {
  const { teamMemberProfile } = useRole();
  const [countdown, setCountdown] = useState(0);
  const [selectedType, setSelectedType] = useState<Props["type"]>(type);
  const [activePage, setActivePage] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // store interval to clear later
  const queryClient = useQueryClient();

  const statusKey = selectedType.toUpperCase() as
    | "EARNINGS"
    | "WITHDRAWAL"
    | "DEPOSIT"
    | "REFERRAL";

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      "transaction-history",
      statusKey,
      teamMemberProfile?.company_member_id,
      activePage,
    ],
    queryFn: async () => {
      const result = await getTransactionHistory({
        page: activePage,
        status: statusKey,
        limit: PAGE_LIMIT,
      });
      return {
        page: activePage,
        transactions: result.transactionHistory,
        total: result.totalTransactions,
      };
    },

    enabled: !!teamMemberProfile,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const flatData = useMemo(() => {
    return data?.transactions || [];
  }, [data]);

  const totalCount = data?.total || 0;
  const pageCount = Math.ceil(totalCount / PAGE_LIMIT);

  const handleSpecificPage = (page: number) => {
    setActivePage(page);
  };

  const handleNextPage = () => {
    setActivePage((prev) => Math.min(prev + 1, pageCount));
  };

  const handlePreviousPage = () => {
    setActivePage((prev) => Math.max(prev - 1, 1));
  };

  const handleRefresh = () => {
    refetch();
    setCountdown(30);

    ["EARNINGS", "WITHDRAWAL", "DEPOSIT", "REFERRAL"].forEach((key) => {
      queryClient.invalidateQueries({
        queryKey: [
          "transaction-history",
          key,
          teamMemberProfile?.company_member_id,
        ],
      });
    });

    // Clear previous interval if exists
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start new countdown
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleChangeType = (value: string) => {
    setSelectedType(value as Props["type"]);

    window.history.pushState(
      {},
      "",
      `/digi-dash/history/${value.toLowerCase()}`
    );
  };
  return (
    <div>
      <div className="mb-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="space-x-1">
            <span className="text-2xl font-normal text-white">
              {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}{" "}
              Transactions
            </span>
          </div>

          {!isBackHidden && (
            <div className="flex justify-end items-end">
              <Link href="/digi-dash">
                <Button className="font-black rounded-lg px-4 dark:bg-white text-black">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="flex justify-between gap-2">
          <Select onValueChange={handleChangeType} defaultValue={selectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Select a transaction type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
              <SelectItem value="deposit">Deposit</SelectItem>
              <SelectItem value="earnings">Earnings</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleRefresh}
            disabled={isLoading || countdown > 0}
            className="flex items-center gap-2 px-4 py-2  rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Refresh {countdown > 0 ? `(${countdown}s)` : ""}
          </Button>
        </div>
      </div>

      <HistoryCardList
        data={flatData}
        activePage={activePage}
        handleSpecificPage={handleSpecificPage}
        handleNextPage={handleNextPage}
        handlePreviousPage={handlePreviousPage}
        pageCount={pageCount}
        isLoading={isLoading || isFetching}
        currentStatus={statusKey}
      />
    </div>
  );
};

export default HistoryTable;
