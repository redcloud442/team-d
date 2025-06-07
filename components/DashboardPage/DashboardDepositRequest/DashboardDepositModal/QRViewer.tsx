import Image from "next/image";

const QRViewer = ({ qrImageSrc }: { qrImageSrc: string }) => {
  return (
    <div className="">
      <h1 className="text-3xl font-bold mb-6 text-center">QR Code</h1>

      <div className="flex justify-center">
        <div className="relative overflow-hidden rounded-lg border-2 border-gray-200">
          <Image
            src={qrImageSrc}
            alt="QR Code"
            width={300}
            height={300}
            className="block"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default QRViewer;
