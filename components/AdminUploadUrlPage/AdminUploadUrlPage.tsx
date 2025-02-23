"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  handleFetchTestimonials,
  handleUploadTestimonial,
} from "@/services/Testimonials/Admin";
import { createClientSide } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { alliance_testimonial_table } from "@prisma/client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
            ["video/mp4", "video/webm", "video/quicktime"].includes(
              file.type
            ) && file.size <= 60 * 1024 * 1024 // 60MB limit
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

  const { toast } = useToast();
  const supabase = createClientSide();
  const [hoveredIndex, setHoveredIndex] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [page, setPage] = useState(1);
  const [testimonials, setTestimonials] = useState<
    alliance_testimonial_table[]
  >([]);
  const [testimonialsCount, setTestimonialsCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const selectedFiles = watch("file") || [];
  const take = 15;

  const handleGetTestimonials = async () => {
    try {
      setIsFetching(true);
      const { testimonial, total } = await handleFetchTestimonials({
        take,
        skip: page,
      });

      setTestimonials((prev) =>
        page === 1 ? testimonial : [...prev, ...testimonial]
      );

      setTestimonialsCount(total);

      if (testimonials.length + take >= total) {
        setHasMore(false);
      }
    } catch (error) {
    } finally {
      setIsFetching(false);
    }
  };

  const loadNextPage = () => {
    if (testimonials.length < testimonialsCount && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  const handleUploadUrl = async (data: FormData) => {
    setLoading(true);
    setProgress(0);
    const files = data.file;
    const url: string[] = [];
    const totalFiles = files.length;

    try {
      for (let i = 0; i < totalFiles; i++) {
        const fileItem = files[i];
        const filePath = `uploads/${Date.now()}_${fileItem.name}`;

        const { error: uploadError } = await supabase.storage
          .from("TESTIMONIAL_BUCKET")
          .upload(filePath, fileItem, { upsert: true });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        const publicUrl =
          "https://cdn.primepinas.com/storage/v1/object/public/TESTIMONIAL_BUCKET/" +
          filePath;
        url.push(publicUrl);

        const uploadProgress = Math.round(((i + 1) / totalFiles) * 80);
        setProgress(uploadProgress);
      }

      // Process testimonial creation (remaining 20%).
      const response = await handleUploadTestimonial(url);
      setTestimonials((prev) => [...prev, ...response]);
      setProgress(100);

      reset();
      toast({
        title: `Uploaded ${totalFiles} file(s) successfully!`,
      });
    } catch (error) {
      toast({
        title: "Failed to upload files.",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      supabase.storage.from("TESTIMONIAL_BUCKET").remove(url);
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    handleGetTestimonials();
  }, [page]);

  return (
    <div className="sm:relative sm:mx-auto p-6 md:p-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">List of Testimonials</h1>
      </div>

      <form onSubmit={handleSubmit(handleUploadUrl)} className="space-y-4">
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
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload Files"}
        </Button>
        {loading && (
          <>
            <Progress value={progress} />
            <p className="text-sm text-gray-500">{progress}% uploaded</p>
            <p className="text-lg text-center text-red-500">
              Please stay on this page while uploading to prevent any errors
            </p>
          </>
        )}
      </form>

      <ScrollArea className="h-[1100px] border rounded-lg p-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.alliance_testimonial_id}
              className="w-full relative h-full flex justify-center overflow-hidden rounded-lg dark:bg-transparent"
              onMouseEnter={() =>
                setHoveredIndex(testimonial.alliance_testimonial_id)
              }
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <CardContent className="p-0">
                {hoveredIndex === testimonial.alliance_testimonial_id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg cursor-pointer">
                    <AdminUploadModalDelete
                      testimonialId={testimonial.alliance_testimonial_id}
                      setTestimonials={setTestimonials}
                    />
                    <Button className="text-black bg-cardColor bg-opacity-70 px-4 py-2 rounded-full text-lg cursor-pointer">
                      ▶
                    </Button>
                  </div>
                )}
                <video
                  src={testimonial.alliance_testimonial_url}
                  loop
                  muted
                  playsInline
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
        {hasMore && testimonials.length !== 0 && (
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
