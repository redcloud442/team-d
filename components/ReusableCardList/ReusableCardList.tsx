export type ColumnDefinition<T> = {
  header: React.ReactNode;
  render: (item: T, index?: number) => React.ReactNode;
  show?: boolean;
};

type Props<T> = {
  data: T[];
  count: number;
  isLoading?: boolean;
  onLoadMore?: () => void;
  columns: ColumnDefinition<T>[];
  emptyMessage?: string;
  getRowId: (item: T) => string; // 👈 NEW: caller defines unique ID field
};

const GenericTableList = <T extends object>({
  data,
  count,
  isLoading = false,
  onLoadMore,
  columns,
  emptyMessage = "No data found.",
  getRowId,
}: Props<T>) => {
  if (isLoading && data.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-14 rounded-md animate-pulse" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return <p className="text-center text-gray-500">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-blue-500 shadow-md bg-blue-500/5">
      <table className="min-w-full text-sm table-fixed" border={1}>
        <thead className="bg-[#0f172a] text-white uppercase text-xs">
          <tr>
            {columns
              .filter((col) => col.show !== false)
              .map((col, idx) => (
                <th key={idx} className="px-4 py-3 font-bold text-left">
                  {col.header}
                </th>
              ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-blue-700/20 text-white font-medium">
          {data.map((item, rowIndex) => (
            <tr key={getRowId(item)}>
              {columns
                .filter((col) => col.show !== false)
                .map((col, colIndex) => (
                  <td key={colIndex} className="px-4 py-3">
                    {col.render(item, rowIndex)}
                  </td>
                ))}
            </tr>
          ))}
        </tbody>
      </table>

      {count > data.length && (
        <div className="p-4 text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-full transition"
          >
            {isLoading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default GenericTableList;
