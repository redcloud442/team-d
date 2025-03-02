import { TopUpRequestData } from "@/utils/types";
import { ColumnDef, Table as ReactTable } from "@tanstack/react-table";
import { Dispatch, SetStateAction } from "react";
import ReusableTable from "../ReusableTable/ReusableTable";

type Props = {
  table: ReactTable<TopUpRequestData>;
  columns: ColumnDef<TopUpRequestData>[];
  activePage: number;
  totalCount: number;
  setActivePage: Dispatch<SetStateAction<number>>;
  pageCount: number;
  isFetchingList: boolean;
};

const AdminTopUpApprovalTabs = ({
  table,
  columns,
  activePage,
  totalCount,
  setActivePage,
  pageCount,
  isFetchingList,
}: Props) => {
  return (
    <ReusableTable
      table={table}
      columns={columns}
      activePage={activePage}
      totalCount={totalCount}
      isFetchingList={isFetchingList}
      setActivePage={setActivePage}
      pageCount={pageCount}
    />
  );
};

export default AdminTopUpApprovalTabs;
