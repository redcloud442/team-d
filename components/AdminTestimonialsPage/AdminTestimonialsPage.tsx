"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getProofOfEarningsVideo } from "@/services/Dasboard/Member";
import { UploadTestimonial } from "@/services/Testimonials/testimonials";
import { createClientSide } from "@/utils/supabase/client";
import { company_proof_table } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { Card, CardContent } from "../ui/card";
import FileUploadVideo from "../ui/dropZoneVideo";
import { Progress } from "../ui/progress";
import { ScrollArea } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";
import { AdminUploadModalDelete } from "./AdminUploadModalDelete";

const schema = z.object({
  file: z
    .array(z.instanceof(File))
    .nonempty("At least one file is required")
    .refine(
      (files) =>
        files.every(
          (file) =>
            [
              "video/mp4",
              "video/webm",
              "video/quicktime",
              "video/mkv",
              "video/avi",
              "video/x-matroska",
            ].includes(file.type) && file.size <= 62 * 1024 * 1024 // 60MB limit
        ),
      { message: "All files must be valid videos and less than 60MB." }
    ),
});

type FormData = z.infer<typeof schema>;

const AdminUploadUrlPage = () => {
  const {
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const supabase = createClientSide();
  const [hoveredIndex, setHoveredIndex] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const selectedFiles = watch("file") || [];

  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey: ["testimonials-video"],
    queryFn: ({ pageParam = 1 }) =>
      getProofOfEarningsVideo({ page: pageParam, take: 15 }),
    getNextPageParam: (lastPage, pages) => {
      const loadedCount = pages.reduce(
        (acc, page) => acc + page.data.length,
        0
      );
      return loadedCount < lastPage.total ? pages.length + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 10,
  });

  const capturePosterFrame = (file: File) => {
    return new Promise<File>((resolve) => {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      video.crossOrigin = "anonymous";
      video.muted = true;

      video.addEventListener("loadeddata", () => {
        video.currentTime = 1; // Capture frame at 1s mark
      });

      video.addEventListener("seeked", () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            const posterFile = new File([blob], "poster.jpg", {
              type: "image/jpeg",
            });
            resolve(posterFile);
          }
        }, "image/jpeg");
      });
    });
  };

  const { mutate: uploadTestimonial, isPending } = useMutation({
    mutationFn: (data: FormData) => handleUploadUrl(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["testimonials-video"] });

      const previousData = queryClient.getQueryData(["testimonials-video"]);

      const optimisticItems: company_proof_table[] = await Promise.all(
        data.file.map(async (file) => {
          const filePath = `uploads/${Date.now()}_${file.name}`;
          const posterPath = filePath.replace(/\.\w+$/, ".jpg");

          return {
            company_proof_id: uuidv4(),
            company_proof_video: `${process.env.NODE_ENV === "development" ? process.env.NEXT_PUBLIC_SUPABASE_URL : "https://cdn.digi-wealth.vip"}/storage/v1/object/public/TESTIMONIAL_BUCKET/${filePath}`,
            company_proof_thumbnail: `${process.env.NODE_ENV === "development" ? process.env.NEXT_PUBLIC_SUPABASE_URL : "https://cdn.digi-wealth.vip"}/storage/v1/object/public/TESTIMONIAL_BUCKET/${posterPath}`,
            company_proof_date: new Date(),
          };
        })
      );

      queryClient.setQueryData(
        ["testimonials-video"],
        (old: {
          pages: {
            data: company_proof_table[];
          }[];
        }) => {
          if (!old) return old;
          return {
            ...old,
            pages: [
              {
                ...old.pages[0],
                data: [...optimisticItems, ...old.pages[0].data],
              },
              ...old.pages.slice(1),
            ],
          };
        }
      );

      return { previousData };
    },
    onError: (_error, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["testimonials-video"], context.previousData);
      }
      toast({
        title: "Upload failed",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({ title: "Uploaded successfully!" });
      reset();
    },
    // onSettled: () => {
    //   queryClient.invalidateQueries({ queryKey: ["testimonials-video"] });
    // },
  });

  const handleUploadUrl = async (data: FormData) => {
    const files = data.file;
    const totalFiles = files.length;
    const optimisticItems: company_proof_table[] = [];

    for (let i = 0; i < totalFiles; i++) {
      const fileItem = files[i];
      const filePath = `uploads/${Date.now()}_${fileItem.name}`;
      const poster = await capturePosterFrame(fileItem);
      const posterPath = filePath.replace(/\.\w+$/, ".jpg");

      optimisticItems.push({
        company_proof_id: uuidv4(),
        company_proof_video: `${process.env.NODE_ENV === "development" ? process.env.NEXT_PUBLIC_SUPABASE_URL : "https://cdn.digi-wealth.vip"}/storage/v1/object/public/TESTIMONIAL_BUCKET/${filePath}`,
        company_proof_thumbnail: `${process.env.NODE_ENV === "development" ? process.env.NEXT_PUBLIC_SUPABASE_URL : "https://cdn.digi-wealth.vip"}/storage/v1/object/public/TESTIMONIAL_BUCKET/${posterPath}`,
        company_proof_date: new Date(),
      });

      const { error: uploadError } = await supabase.storage
        .from("TESTIMONIAL_BUCKET")
        .upload(filePath, fileItem, { upsert: true });
      if (uploadError) throw new Error(uploadError.message);

      const { error: posterUploadError } = await supabase.storage
        .from("TESTIMONIAL_BUCKET")
        .upload(posterPath, poster, { upsert: true });
      if (posterUploadError) throw new Error(posterUploadError.message);
      setProgress(((i + 1) / totalFiles) * 100);
    }

    await UploadTestimonial(optimisticItems);
  };

  const handleFileChange = (files: File[] | null) => {
    if (files && files.length > 0) {
      setValue("file", [files[0], ...files.slice(1)]);
    }
  };

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

  const testimonials = useMemo(
    () => data?.pages.flatMap((page) => page.data) || [],
    [data]
  );

  const loadNextPage = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div className="sm:relative sm:mx-auto p-6 md:p-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">List of Testimonials</h1>
      </div>

      <form
        onSubmit={handleSubmit((data) => uploadTestimonial(data))}
        className="space-y-4"
      >
        <FileUploadVideo
          label="Upload Video"
          onFileChange={(files) => handleFileChange(files || [])}
        />
        {selectedFiles.length > 0 && (
          <p className="text-green-500 text-sm">
            {selectedFiles.length} file(s) selected
          </p>
        )}
        {errors.file && (
          <p className="text-red-500 text-sm">{errors.file.message}</p>
        )}
        <Button
          type="submit"
          variant="card"
          className="w-full h-12 rounded-lg"
          disabled={isPending}
        >
          {isPending ? "Uploading..." : "Upload Files"}
        </Button>
        {isPending && (
          <div className="fixed top-0 left-0 w-full h-full flex flex-col items-center justify-center z-50 bg-black/70">
            <div className="z-50 flex flex-col items-center gap-2">
              <Progress value={Number(progress.toFixed(2))} className="w-64" />
              <p className="text-sm text-gray-300">{progress}% uploaded</p>
              <p className="text-lg text-center text-red-400 font-semibold max-w-sm text-wrap px-4">
                Please stay on this page while uploading to prevent any errors
              </p>
            </div>
          </div>
        )}
      </form>

      <ScrollArea className="h-[1100px] border rounded-lg p-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.company_proof_id}
              className="w-full relative h-full flex justify-center overflow-hidden rounded-lg dark:bg-transparent"
              onMouseEnter={() => setHoveredIndex(testimonial.company_proof_id)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <CardContent className="p-0">
                {hoveredIndex === testimonial.company_proof_id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg cursor-pointer">
                    <AdminUploadModalDelete
                      testimonialId={testimonial.company_proof_id}
                    />
                    <Button className="text-black bg-cardColor bg-opacity-70 px-4 py-2 rounded-full text-lg cursor-pointer">
                      ▶
                    </Button>
                  </div>
                )}
                <video
                  src={testimonial.company_proof_video}
                  loop
                  muted
                  playsInline
                  preload="none"
                  poster={testimonial.company_proof_thumbnail ?? undefined}
                  className="w-full h-full object-cover aspect-auto md:aspect-square rounded-lg dark:bg-transparent"
                  onClick={openVideoFullscreen}
                />
              </CardContent>
            </Card>
          ))}
          {isFetching && (
            <>
              <Skeleton className="w-full h-80 bg-amber-50" />
              <Skeleton className="w-full h-80 bg-amber-50" />
              <Skeleton className="w-full h-80 bg-amber-50" />
            </>
          )}
        </div>
        {hasNextPage && (
          <div className="relative flex justify-center items-center h-full mt-4">
            <Button
              className="text-black bg-cardColor bg-opacity-70 px-4 py-2  text-lg cursor-pointer rounded-md"
              onClick={loadNextPage}
              disabled={isFetching}
            >
              {isFetching ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default AdminUploadUrlPage;
