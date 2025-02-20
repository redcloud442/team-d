import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";

const SlideSection = () => {
  return (
    <div className="relative flex justify-center items-center w-full min-h-screen text-white">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/landing/background.jpg"
          alt="Background"
          width={1920}
          height={1080}
          quality={80}
          className="object-cover w-full h-full"
          priority
        />
      </div>
      <Carousel>
        <CarouselContent>
          <CarouselItem> </CarouselItem>
          <CarouselItem>...</CarouselItem>
          <CarouselItem>...</CarouselItem>
        </CarouselContent>
      </Carousel>

      <div className="z-30 absolute bottom-0 bg-amber-400 w-full h-[50vh]"></div>
    </div>
  );
};

export default SlideSection;
