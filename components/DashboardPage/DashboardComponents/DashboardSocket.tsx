import Image from "next/image";

const DashboardSocket = () => {
  return (
    <div className="px-6">
      <div className="flex gap-2 bg-[#0f172a] text-white px-3 py-1 rounded-md justify-center relative">
        <Image
          src="/assets/icons/microphone.ico"
          alt="Deposit"
          width={40}
          height={40}
          className=" absolute -left-4 -top-1"
        />
        <div className="flex items-center gap-1 text-sm font-semibold">
          <span className="w-2 h-2 rounded-full bg-bg-primary-blue inline-block"></span>
          <span>J****a Successfully Deposit</span>
          <span className="text-white font-black">₱1,000.00!</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardSocket;
