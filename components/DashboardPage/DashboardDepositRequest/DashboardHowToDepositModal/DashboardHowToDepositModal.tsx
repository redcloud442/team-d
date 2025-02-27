import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useEffect, useState } from "react";

const DashboardHowToDepositModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const [api, setApi] = useState<CarouselApi>();
  useEffect(() => {
    if (!api) {
      return;
    }

    setActiveSlide(api.selectedScrollSnap() + 1 - 1);

    api.on("select", () => {
      setActiveSlide(api.selectedScrollSnap() + 1 - 1);
    });
  }, [api]);

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button
          className="h-8 bg-pageColor  px-2 text-sm text-white"
          variant="card"
        >
          How to Deposit
        </Button>
      </DialogTrigger>

      <DialogContent className="flex flex-col justify-center items-center">
        <DialogHeader>
          <DialogTitle className="text-xl">How to Deposit</DialogTitle>
        </DialogHeader>
        <DialogDescription />

        <Carousel
          className="w-full max-w-xs"
          opts={{
            align: "start",
          }}
          setApi={setApi}
        >
          <CarouselContent>
            {Array.from({ length: 13 }).map((_, index) => (
              <CarouselItem key={index}>
                <Image
                  src={`/guides/deposit/step-${index + 1}.jpg`}
                  alt="deposit guide"
                  width={1200}
                  height={1200}
                  className="w-full h-full object-cover"
                  priority={index === activeSlide}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Dots for pagination */}
        <div className="flex justify-center space-x-2 mt-4">
          {Array.from({ length: 13 }).map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full cursor-pointer transition ${
                activeSlide === index ? "bg-blue-600" : "bg-gray-400"
              }`}
              onClick={() => setActiveSlide(index)}
            ></div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardHowToDepositModal;
