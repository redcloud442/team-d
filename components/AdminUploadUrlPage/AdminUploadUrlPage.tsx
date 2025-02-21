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

const schema = z.object({
  file: z.array(z.instanceof(File)).nonempty("At least one file is required"),
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

  const supabase = createClientSide();
  const [hoveredIndex, setHoveredIndex] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [testimonials, setTestimonials] = useState<
    alliance_testimonial_table[]
  >([]);

  const { toast } = useToast();

  const selectedFiles = watch("file") || [];

  const handleGetTestimonials = async () => {
    try {
      const data = await handleFetchTestimonials();
      setTestimonials(data);
    } catch (error) {}
  };

  const handleUploadUrl = async (data: FormData) => {
    setLoading(true);
    const files = data.file;
    const url = [];

    for (const fileItem of files) {
      const filePath = `uploads/${Date.now()}_${fileItem.name}`;

      const { error: uploadError } = await supabase.storage
        .from("TESTIMONIAL_BUCKET")
        .upload(filePath, fileItem, { upsert: true });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data: publicUrlData } = supabase.storage
        .from("TESTIMONIAL_BUCKET")
        .getPublicUrl(filePath);

      url.push(publicUrlData.publicUrl);
    }
    try {
      const response = await handleUploadTestimonial(url);
      setTestimonials(response);

      toast({
        title: `Uploaded ${files.length} file(s) successfully!`,
      });

      reset();
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

  // Update file list dynamically
  const handleFileChange = (files: File[] | null) => {
    if (files && files.length > 0) {
      setValue("file", [files[0], ...files.slice(1)]);
    }
  };

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
    }
  };

  useEffect(() => {
    handleGetTestimonials();
  }, []);

  return (
    <div className="container mx-auto p-6 md:p-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">List of Testimonials</h1>
      </div>

      <form onSubmit={handleSubmit(handleUploadUrl)} className="space-y-4">
        <FileUploadVideo
          label="Upload Video"
          onFileChange={(files) => handleFileChange(files || [])}
        />

        {/* Show file count */}
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
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.map((testimonial) => (
          <Card
            key={testimonial.alliance_testimonial_id}
            className="w-full h-full flex justify-center overflow-hidden rounded-lg dark:bg-transparent relative"
            onMouseEnter={() =>
              setHoveredIndex(testimonial.alliance_testimonial_id)
            }
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <CardContent className="p-0">
              {/* Play Button Overlay */}
              {hoveredIndex === testimonial.alliance_testimonial_id && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
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
      </div>
    </div>
  );
};

export default AdminUploadUrlPage;
