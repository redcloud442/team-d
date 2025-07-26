import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { getProofOfEarninggetsVideo } from "@/services/Dasboard/Member";
import { useQuery } from "@tanstack/react-query";

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

  const carouselSlides: { id: string; content: React.ReactNode }[] =
    proofOfEarnings?.map((proof, index) => ({
      id: `proof-of-earnings-${index}`,
      content: (
        <div className="space-y-4 h-full">
          <div className="relative h-full">
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg cursor-pointer">
              <Button>▶</Button>
            </div>

            <video
              src={proof.company_proof_video}
              preload="none"
              poster={proof.company_proof_thumbnail ?? undefined}
              className="w-full h-full object-cover aspect-auto md:aspect-square rounded-lg"
              onClick={openVideoFullscreen}
            />
          </div>
        </div>
      ),
    })) ?? [];

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
