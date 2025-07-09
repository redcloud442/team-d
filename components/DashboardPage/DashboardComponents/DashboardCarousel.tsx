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

  const banners = queryClient.getQueryData([
    "banners",
  ]) as company_promo_table[];
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

  const carouselSlides: { id: string; content: React.ReactNode }[] = [
    {
      id: "dashboard",
      content: (
        <>
          <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
          <div className="flex justify-center h-full">
            <div className="grid grid-cols-2 gap-4 justify-center w-full">
              {totalEarningsMap.map(({ key, label, value }) => (
                <div key={key} className="text-center">
                  <p className="text-xl text-bg-primary-blue">{label}</p>
                  <p className="text-lg font-semibold">
                    ₱ {formatNumberLocale(value ?? 0)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      ),
    },

    /* 2 ––– Proof-of-earnings video ––– */
    proofOfEarnings?.length
      ? {
          id: "proof-of-earnings",
          content: (
            <div className="space-y-4 h-full">
              <div className="flex justify-between items-center gap-2">
                <h2 className="text-2xl font-bold">Proof of Earnings</h2>
                <DashboardProofOfEarnings
                  openVideoFullscreen={openVideoFullscreen}
                />
              </div>

              <div className="relative h-full">
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg cursor-pointer">
                  <Button>▶</Button>
                </div>

                <video
                  src={proofOfEarnings[0].company_proof_video}
                  preload="none"
                  poster={
                    proofOfEarnings[0].company_proof_thumbnail ?? undefined
                  }
                  className="w-full h-full object-cover aspect-auto md:aspect-square rounded-lg"
                  onClick={openVideoFullscreen}
                />
              </div>
            </div>
          ),
        }
      : null,
    /* nothing else added here; banners get appended below */
  ].filter(Boolean) as { id: string; content: React.ReactNode }[];

  /* 3 ––– 1 slide *per* banner ––– */
  if (banners?.length) {
    banners.forEach((promo) => {
      carouselSlides.push({
        id: `promo-${promo.company_promo_id}`,
        content: (
          <>
            <h2 className="text-2xl font-bold mb-4">Promotional</h2>
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
        <CarouselContent className="h-[500px] w-full">
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
