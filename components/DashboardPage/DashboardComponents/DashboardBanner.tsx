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
} from "@/components/ui/dialog";
import { GetBanners } from "@/services/Banner/Banner";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useState } from "react";

const DashboardGuidesModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const { data: banners, isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: GetBanners,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

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
    !isLoading &&
    !!banners?.length && (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="flex flex-col justify-center items-center">
          <DialogHeader className="hidden">
            <DialogTitle className="text-xl"></DialogTitle>
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
              {Array.from({ length: banners?.length || 0 }).map((_, index) => (
                <CarouselItem key={index}>
                  <Image
                    src={`${banners?.[index]?.company_promo_image || ""}`}
                    alt="guide"
                    width={1500}
                    height={1500}
                    className="w-full h-full object-cover"
                    priority={index === activeSlide}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Dots for pagination */}
          <div className="flex justify-center space-x-2 mt-4">
            {Array.from({ length: banners?.length || 0 }).map((_, index) => (
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
    )
  );
};

export default DashboardGuidesModal;
