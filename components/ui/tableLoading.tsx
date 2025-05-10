import Image from "next/image";

const TableLoading = () => {
  return (
    <div
      className={`block absolute inset-0 top-0 left-0 bg-pageColor/50 dark:bg-zinc-800/70 z-50 transition-opacity duration-300`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-pulse transition-all duration-1000">
          <Image
            src="/assets/icons/logo.ico"
            alt="thunder"
            width={100}
            height={100}
          />
        </div>
      </div>
    </div>
  );
};

export default TableLoading;
