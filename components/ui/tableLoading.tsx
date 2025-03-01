import { Loader2 } from "lucide-react";

const TableLoading = () => {
  return (
    <div
      className={`block absolute inset-0 top-0 left-0 bg-pageColor/50 dark:bg-zinc-800/70 z-50 transition-opacity duration-300`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-pulse transition-all duration-1000">
          <Loader2 className="w-10 h-10 animate-spin text-yellow-500" />
        </div>
      </div>
    </div>
  );
};

export default TableLoading;
