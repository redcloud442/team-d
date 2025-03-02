import { WithdrawalRequestData } from "@/utils/types";
import { ColumnDef, Table as ReactTable } from "@tanstack/react-table";
import { Dispatch, SetStateAction } from "react";
import ReusableTable from "../ReusableTable/ReusableTable";

type Props = {
  table: ReactTable<WithdrawalRequestData>;
  columns: ColumnDef<WithdrawalRequestData>[];
  activePage: number;
  totalCount: number;
  setActivePage: Dispatch<SetStateAction<number>>;
  pageCount: number;
  isFetchingList: boolean;
};

const WithdrawalTabs = ({
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

export default WithdrawalTabs;
