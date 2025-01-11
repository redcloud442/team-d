import Image from "next/image";

type Props = {
  visible: boolean;
};
const NavigationLoader = ({ visible }: Props) => {
  return (
    <div
      className={`fixed flex inset-0 bg-pageColor dark:bg-zinc-800 z-50 flex-col items-center justify-center transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="animate-pulse transition-all duration-1000">
        <Image src="/app-logo.svg" alt="thunder" width={100} height={100} />
      </div>
    </div>
  );
};

export default NavigationLoader;
