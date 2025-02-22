import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { alliance_testimonial_table } from "@prisma/client";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { useRef, useState } from "react";

type Testimonial = {
  alliance_testimonial_url: alliance_testimonial_table[];
};

export function TestimonialPage({ alliance_testimonial_url }: Testimonial) {
  const plugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: true }));
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const openVideoFullscreen = (event: React.MouseEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;

    // Apply object-contain only in fullscreen
    const applyObjectContain = () => video.classList.add("object-contain");
    const removeObjectContain = () => video.classList.remove("object-cover");
    const applyObjectCover = () => video.classList.add("object-cover");

    // Listen for fullscreen change events
    video.addEventListener("fullscreenchange", () => {
      removeObjectContain();
      if (document.fullscreenElement) {
        applyObjectContain();
      } else {
        applyObjectCover();
        video.muted = true;
        video.pause();
      }
    });

    // Open in fullscreen
    if (video.requestFullscreen) {
      video.requestFullscreen();
      video.muted = false;
      video.play();
    } else {
      video.muted = true;
      video.pause();
    }
  };

  return (
    <div className="flex flex-col sm:items-center w-full bg-cardColor py-6 rounded-xl">
      <div className="flex items-center justify-center gap-2 w-full">
        <Image src="/app-logo.png" alt="testimonial" width={80} height={80} />
        <h1 className="text-2xl font-bold text-black">Testimonials</h1>
      </div>
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent className="px-10">
          {alliance_testimonial_url.map((url, index) => (
            <CarouselItem
              key={index}
              className="lg:basis-1/4 md:basis-1/4 sm:basis-full flex justify-center dark:bg-transparent "
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Card className="w-full h-full flex justify-center overflow-hidden rounded-lg dark:bg-transparent relative">
                <CardContent className="p-0">
                  {/* Play Button Overlay */}
                  {hoveredIndex === index && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                      <Button className="text-black bg-cardColor bg-opacity-70 px-4 py-2 rounded-full text-lg cursor-pointer">
                        ▶
                      </Button>
                    </div>
                  )}
                  <video
                    src={url.alliance_testimonial_url}
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover aspect-auto md:aspect-square rounded-lg dark:bg-transparent"
                    onClick={openVideoFullscreen}
                  />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
