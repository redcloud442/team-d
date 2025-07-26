import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { formatNumberLocale } from "@/utils/function";
import { company_promo_table } from "@/utils/types";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";

type Props = {
  totalEarningsMap: {
    key: string;
    label: string;
    value: number;
  }[];
};

const DashboardCarousel = ({ totalEarningsMap }: Props) => {
  const queryClient = useQueryClient();

  const banners = queryClient.getQueryData([
    "banners",
  ]) as company_promo_table[];

  const carouselSlides: { id: string; content: React.ReactNode }[] = [
    {
      id: "dashboard",
      content: (
        <>
          <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
          <div className="flex justify-center h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-center w-full">
              {totalEarningsMap.map(({ key, label, value }) => (
                <div key={key} className="text-center">
                  <p className="text-xl text-bg-primary-blue">{label}</p>
                  <p className="text-lg font-semibold">
                    {formatNumberLocale(value ?? 0)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      ),
    },
  ].filter(Boolean) as { id: string; content: React.ReactNode }[];

  /* 3 ––– 1 slide *per* banner ––– */
  if (banners?.length) {
    banners.forEach((promo) => {
      carouselSlides.push({
        id: `promo-${promo.company_promo_id}`,
        content: (
          <>
            <Image
              src={promo.company_promo_image}
              alt={`${promo.company_promo_id} – promo`}
              width={600}
              height={600}
              className="w-full h-full object-contain rounded-lg"
            />
          </>
        ),
      });
    });
  }

  /** =========================
   *  Render
   * ========================= */
  return (
    <div className="border-2 border-bg-primary-blue px-4 py-6 rounded-md overflow-hidden">
      <Carousel
        className="w-full min-h-fit flex flex-col items-center justify-center"
        opts={{ align: "center" }}
      >
        <CarouselContent className="h-[500px] w-full min-w-xl max-w-2xl">
          {carouselSlides.map(({ id, content }) => (
            <CarouselItem key={id} className="w-full">
              {content}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default DashboardCarousel;
