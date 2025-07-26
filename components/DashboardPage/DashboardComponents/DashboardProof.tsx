import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { getProofOfEarninggetsVideo } from "@/services/Dasboard/Member";
import { useQuery } from "@tanstack/react-query";
import DashboardProofOfEarnings from "./DashboardProofOfEarnings";

const DashboardProof = () => {
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

export default DashboardProof;
