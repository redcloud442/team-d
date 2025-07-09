import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { getProofOfEarninggetsVideo } from "@/services/Dasboard/Member";
import { formatNumberLocale } from "@/utils/function";
import { company_promo_table } from "@/utils/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import DashboardProofOfEarnings from "./DashboardProofOfEarnings";

type Props = {
  totalEarningsMap: {
    key: string;
    label: string;
    value: number;
  }[];
};

const DashboardCarousel = ({ totalEarningsMap }: Props) => {
  const queryClient = useQueryClient();

  const banner = queryClient.getQueryData(["banners"]) as company_promo_table[];
  const { data: proofOfEarnings } = useQuery({
    queryKey: ["proof-of-earnings"],
    queryFn: () => getProofOfEarninggetsVideo(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  const openVideoFullscreen = (event: React.MouseEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    const applyObjectContain = () => video.classList.add("object-contain");
    const removeObjectContain = () => video.classList.remove("object-cover");
    const applyObjectCover = () => video.classList.add("object-cover");

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

    if (video.requestFullscreen) {
      video.requestFullscreen();
      video.muted = false;
      video.play();
    }
  };

  const CarouselItems = [
    {
      id: "1",
      content: (
        <>
          <div className="text-2xl font-bold">Dashboard</div>
          <div className="space-y-4 h-full flex flex-col justify-center w-full">
            <div className="grid grid-cols-2 gap-4 w-full">
              {totalEarningsMap?.map((item) => (
                <div key={item.key} className="mb-3 text-center w-full">
                  <div className="text-xl mb-1 text-bg-primary-blue">
                    {item.label}
                  </div>
                  <div className=" text-white py-1 rounded-lg font-semibold text-lg">
                    ₱ {formatNumberLocale(item.value ?? 0)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ),
    },

    {
      id: "2",
      content: proofOfEarnings?.length ? (
        <div className="h-full space-y-4">
          <div className="flex justify-between gap-2">
            <div className="text-2xl font-bold">Proof of Earnings</div>
            <DashboardProofOfEarnings
              openVideoFullscreen={openVideoFullscreen}
            />
          </div>

          <div
            key={proofOfEarnings[0].company_proof_id}
            className="h-full relative"
          >
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg cursor-pointer">
              <Button>▶</Button>
            </div>

            <video
              src={proofOfEarnings[0].company_proof_video}
              preload="none"
              poster={proofOfEarnings[0].company_proof_thumbnail ?? undefined}
              className="w-full h-full object-cover aspect-auto md:aspect-square rounded-lg dark:bg-transparent"
              onClick={openVideoFullscreen}
            />
          </div>
        </div>
      ) : null,
    },

    {
      id: "3",
      content: banner?.length ? (
        <div className="h-full">
          <div className="text-2xl font-bold">Promotional</div>
          {banner.map((item) => (
            <Image
              src={item.company_promo_image}
              alt={`${item.company_promo_id} - promo`}
              width={300}
              height={300}
              key={item.company_promo_id}
              className="w-full h-full object-contain"
            />
          ))}
        </div>
      ) : null,
    },
  ];

  return (
    <div className="border-2 border-bg-primary-blue px-4 py-6 rounded-md relative overflow-hidden">
      <Carousel
        className="w-full overflow-hidden min-h-fit flex flex-col items-center justify-center"
        opts={{
          align: "center",
        }}
      >
        <CarouselContent className="h-[500px] w-full">
          {CarouselItems?.map(
            (item) =>
              item.content !== null && (
                <CarouselItem className="w-full" key={item.id}>
                  {item.content}
                </CarouselItem>
              )
          )}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default DashboardCarousel;
