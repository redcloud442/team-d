"use client";

import { getAllyBounty } from "@/services/Bounty/Member";
import { useDirectReferralStore } from "@/store/useDirectReferralStore";
import { useRole } from "@/utils/context/roleContext";
import { escapeFormData } from "@/utils/function";
import { user_table } from "@/utils/types";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import GenericTableList from "../ReusableCardList/ReusableCardList";
import { AllyBountyColumn } from "./AllyBountyColum";

type FilterFormValues = {
  emailFilter: string;
};

const AllyBountyTable = () => {
  const [activePage, setActivePage] = useState(1);
  const [isFetchingList, setIsFetchingList] = useState(false);

  const { teamMemberProfile } = useRole();
  const { directReferral, setDirectReferral } = useDirectReferralStore();

  const columnAccessor = "user_date_created";
  const isAscendingSort = true;

  const fetchAdminRequest = async () => {
    try {
      if (!teamMemberProfile) return;

      const now = Date.now();
      const SIXTY_SECONDS = 60 * 1000;

      // Skip if data was fetched less than 60 seconds ago
      if (
        directReferral.lastFetchedAt &&
        now - directReferral.lastFetchedAt < SIXTY_SECONDS
      ) {
        return;
      }

      setIsFetchingList(true);

      const sanitizedData = escapeFormData(getValues());

      const { emailFilter } = sanitizedData;

      const { data, totalCount } = await getAllyBounty({
        page: activePage,
        limit: 10,
        columnAccessor: columnAccessor,
        isAscendingSort: isAscendingSort,
        search: emailFilter,
      });

      setDirectReferral({
        data: data as unknown as (user_table & {
          total_bounty_earnings: string;
          package_ally_bounty_log_date_created: Date;
          company_referral_date: Date;
        })[],
        count: totalCount || 0,
      });
    } catch (e) {
    } finally {
      setIsFetchingList(false);
    }
  };

  const columns = AllyBountyColumn();

  const { getValues } = useForm<FilterFormValues>({
    defaultValues: {
      emailFilter: "",
    },
  });

  useEffect(() => {
    fetchAdminRequest();
  }, [teamMemberProfile, activePage]);

  return (
    <GenericTableList
      data={directReferral.data}
      count={directReferral.count}
      isLoading={isFetchingList}
      onLoadMore={() => setActivePage(activePage + 1)}
      columns={columns}
      emptyMessage="No data found."
      getRowId={(item) => item.user_id}
    />
  );
};

export default AllyBountyTable;
