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
    <div className="overflow-x-auto rounded-lg border border-bg-primary-blue shadow-md ">
      <table className="min-w-full text-sm table-fixed" border={1}>
        <tbody className="text-white font-medium">
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
            className="bg-bg-primary-blue hover:bg-blue-700 text-black font-bold px-6 py-2 rounded-full transition"
          >
            {isLoading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default GenericTableList;
