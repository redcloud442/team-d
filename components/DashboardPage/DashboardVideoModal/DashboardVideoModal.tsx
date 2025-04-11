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
import { alliance_promo_banner_table } from "@prisma/client";
import Image from "next/image";
import { useEffect, useState } from "react";

const DashboardVideoModal = ({
  raffle,
}: {
  raffle: alliance_promo_banner_table[];
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    const handleOpen = () => {
      const isLoggedIn = localStorage.getItem("isModalOpen");
      if (isLoggedIn === "true" && raffle.length > 0) {
        setIsModalOpen(true);
      }
    };

    handleOpen();
  }, []);

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
        <Button className="w-full max-w-[140px] min-w-[120px] h-7 cursor-pointer">
          Raffle
        </Button>
      </DialogTrigger>

      <DialogContent
        type="earnings"
        className="flex flex-col justify-center items-center dark:bg-transparent border-none shadow-none"
      >
        <DialogHeader>
          <DialogTitle className="text-xl"></DialogTitle>
        </DialogHeader>
        <DialogDescription />

        <Carousel
          className="w-full"
          opts={{
            align: "start",
          }}
          setApi={setApi}
        >
          <CarouselContent>
            {raffle.length > 0 &&
              raffle.map((item, index) => (
                <CarouselItem key={item.alliance_promo_banner_id}>
                  <Image
                    src={item.alliance_promo_banner_image}
                    alt="guide"
                    width={1400}
                    height={1400}
                    className="w-full h-full rounded-md"
                    priority={index === activeSlide}
                  />
                </CarouselItem>
              ))}
          </CarouselContent>
        </Carousel>

        {/* Dots for pagination */}
        <div className="flex justify-center space-x-2 mt-4">
          {raffle.length > 0 &&
            Array.from({ length: raffle.length }).map((_, index) => (
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

export default DashboardVideoModal;
