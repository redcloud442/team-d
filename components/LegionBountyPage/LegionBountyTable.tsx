"use client";

import { getLegionBounty } from "@/services/Bounty/Member";
import { useIndirectReferralStore } from "@/store/useIndirrectReferralStore";
import { useRole } from "@/utils/context/roleContext";
import { escapeFormData } from "@/utils/function";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import GenericTableList from "../ReusableCardList/ReusableCardList";
import { LegionBountyColumn } from "./LegionBountyColumn";

type FilterFormValues = {
  emailFilter: string;
};

const LegionBountyTable = () => {
  const [activePage, setActivePage] = useState(1);
  const [isFetchingList, setIsFetchingList] = useState(false);

  const { teamMemberProfile } = useRole();

  const { indirectReferral, setIndirectReferral } = useIndirectReferralStore();

  const columnAccessor = "user_date_created";
  const isAscendingSort = true;

  const fetchAdminRequest = async () => {
    try {
      if (!teamMemberProfile) return;

      const now = Date.now();
      const SIXTY_SECONDS = 60 * 1000;

      // Skip if data was fetched less than 60 seconds ago
      if (
        indirectReferral.lastFetchedAt &&
        now - indirectReferral.lastFetchedAt < SIXTY_SECONDS
      ) {
        return;
      }
      setIsFetchingList(true);

      const sanitizedData = escapeFormData(getValues());

      const { emailFilter } = sanitizedData;

      const { data, totalCount } = await getLegionBounty({
        teamMemberId: teamMemberProfile.company_member_id,
        page: activePage,
        limit: 10,
        columnAccessor: columnAccessor,
        isAscendingSort: isAscendingSort,
        search: emailFilter,
      });

      setIndirectReferral({
        data: data || [],
        count: totalCount || 0,
      });
    } catch (e) {
    } finally {
      setIsFetchingList(false);
    }
  };

  const columns = LegionBountyColumn();

  const { getValues } = useForm<FilterFormValues>({
    defaultValues: {
      emailFilter: "",
    },
  });

  useEffect(() => {
    fetchAdminRequest();
  }, [activePage, teamMemberProfile]);

  return (
    <GenericTableList
      data={indirectReferral.data}
      count={indirectReferral.count}
      isLoading={isFetchingList}
      onLoadMore={() => setActivePage(activePage + 1)}
      columns={columns}
      emptyMessage="No data found."
      getRowId={(item) => item.user_id}
    />
  );
};

export default LegionBountyTable;
