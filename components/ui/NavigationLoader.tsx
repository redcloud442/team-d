import Image from "next/image";

type Props = {
  visible: boolean;
};

const NavigationLoader = ({ visible }: Props) => {
  return (
    <div
      className={`fixed inset-0 z-[9999] flex bg-pageColor dark:bg-zinc-800 flex-col items-center justify-center duration-300 ${
        visible ? "" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="animate-pulse transition-all duration-1000">
        <Image src="/app-logo.png" alt="thunder" width={100} height={100} />
      </div>
    </div>
  );
};

export default NavigationLoader;
