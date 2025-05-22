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

      const mergedData = [
        ...(activePage > 1 ? (indirectReferral.data ?? []) : []),
        ...data,
      ];

      setIndirectReferral({
        data: mergedData,
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

  const handleLoadMore = () => {
    setActivePage((prev) => prev + 1);
  };

  return (
    <GenericTableList
      data={indirectReferral.data}
      count={indirectReferral.count}
      isLoading={isFetchingList}
      onLoadMore={handleLoadMore}
      columns={columns}
      emptyMessage="No data found."
      getRowId={(item) => item.package_ally_bounty_log_id}
    />
  );
};

export default LegionBountyTable;
