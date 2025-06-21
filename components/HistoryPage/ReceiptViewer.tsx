import Image from "next/image";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

type Props = {
  receipt: string;
};

const ReceiptViewer = ({ receipt }: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-white">
          View Receipt
        </Button>
      </DialogTrigger>

      <DialogContent className="h-[500px] sm:h-[600px]">
        <DialogHeader>
          <DialogTitle>Receipt</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center">
          <Image
            src={receipt}
            alt="receipt"
            width={500}
            height={500}
            className="rounded-md w-full h-full object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptViewer;
