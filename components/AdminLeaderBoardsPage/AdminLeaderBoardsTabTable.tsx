import { ColumnDef, Table as ReactTable } from "@tanstack/react-table";
import { Dispatch, SetStateAction } from "react";
import ReusableTable from "../ReusableTable/ReusableTable";
type LeaderboardData = {
  username: string;
  totalAmount: number;
};

type Props = {
  table: ReactTable<LeaderboardData>;
  columns: ColumnDef<LeaderboardData>[];
  activePage: number;
  totalCount: number;
  setActivePage: Dispatch<SetStateAction<number>>;
  pageCount: number;
  isFetchingList: boolean;
};

const AdminLeaderBoardsTabTable = ({
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
      setActivePage={setActivePage}
      pageCount={pageCount}
      isFetchingList={isFetchingList}
    />
  );
};

export default AdminLeaderBoardsTabTable;
