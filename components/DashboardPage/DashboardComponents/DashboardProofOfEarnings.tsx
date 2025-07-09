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
import { company_proof_table } from "@/utils/types";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type Props = {
  openVideoFullscreen: (event: React.MouseEvent<HTMLVideoElement>) => void;
};

const DashboardGuidesModal = ({ openVideoFullscreen }: Props) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const queryClient = useQueryClient();
  const proofOfEarnings = queryClient.getQueryData([
    "proof-of-earnings",
  ]) as company_proof_table[];

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
    !!proofOfEarnings?.length && (
      <Dialog>
        <DialogTrigger asChild>
          <Button>Show More</Button>
        </DialogTrigger>
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
              {Array.from({ length: proofOfEarnings?.length || 0 }).map(
                (_, index) => (
                  <CarouselItem key={index}>
                    <div className="h-full relative">
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg cursor-pointer">
                        <Button>▶</Button>
                      </div>

                      <video
                        src={`${proofOfEarnings?.[index]?.company_proof_video || ""}`}
                        className="h-full w-96 object-cover"
                        poster={
                          proofOfEarnings?.[index]?.company_proof_thumbnail ||
                          "/images/default-video-thumbnail.jpg"
                        }
                        onClick={openVideoFullscreen}
                      />
                    </div>
                  </CarouselItem>
                )
              )}
            </CarouselContent>
          </Carousel>

          {/* Dots for pagination */}
          <div className="flex justify-center space-x-2 mt-4">
            {Array.from({ length: proofOfEarnings?.length || 0 }).map(
              (_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full cursor-pointer transition ${
                    activeSlide === index ? "bg-blue-600" : "bg-gray-400"
                  }`}
                  onClick={() => setActiveSlide(index)}
                ></div>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  );
};

export default DashboardGuidesModal;
