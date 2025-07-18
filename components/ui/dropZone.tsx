"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ImagePlus } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

type FileUploadProps = {
  label?: string;
  onFileChange: (file: File | null) => void;
};

const FileUpload: React.FC<FileUploadProps> = ({
  label = "File",
  onFileChange,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0] || null;
      onFileChange(file);

      if (file) {
        const preview = URL.createObjectURL(file);
        setPreviewUrl(preview);
      } else {
        setPreviewUrl(null);
      }
    },
    [onFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [
        ".png",
        ".jpg",
        ".jpeg",
        ".webp",
        ".gif",
        ".bmp",
        ".svg",
        ".tiff",
        ".ico",
      ],
    },
    multiple: false,
  });

  return (
    <div className="space-y-2 flex flex-col items-center justify-center">
      <Label>{label}</Label>
      {!previewUrl && (
        <div
          {...getRootProps()}
          className={cn(
            "rounded-md h-44 w-full border-2 flex items-center justify-center text-center cursor-pointer transition",
            isDragActive
              ? "border-2 border-bg-primary-blue"
              : "border-2 border-bg-primary-blue"
          )}
        >
          <Input
            variant="non-card"
            {...getInputProps()}
            className="hidden"
            type="file"
          />
          <ImagePlus className="w-18 h-18" />
        </div>
      )}

      {previewUrl && (
        <div className="">
          <Input
            variant="non-card"
            {...getInputProps()}
            className="hidden"
            type="file"
          />
          <div {...getRootProps()}>
            <Image
              src={previewUrl}
              alt="Preview"
              width={200}
              height={200}
              className="w-full h-96 object-contain border-2 rounded-md"
            />
          </div>
          <p className="text-md font-bold text-gray-400 text-center">
            Click Here to Reupload
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
