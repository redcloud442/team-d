import { company_transaction_table } from "@prisma/client";
import { ColumnDef, Table as ReactTable } from "@tanstack/react-table";
import { Dispatch, SetStateAction } from "react";
import ReusableTable from "../ReusableTable/ReusableTable";
type Props = {
  table: ReactTable<company_transaction_table>;
  columns: ColumnDef<company_transaction_table>[];
  activePage: number;
  totalCount: number;
  setActivePage: Dispatch<SetStateAction<number>>;
  pageCount: number;
  isFetchingList: boolean;
};

const HistoryTabs = ({
  table,
  columns,
  activePage,
  totalCount,
  isFetchingList,
  setActivePage,
  pageCount,
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

export default HistoryTabs;
