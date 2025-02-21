import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils"; // Utility for merging classes, or replace with classNames if preferred
import Image from "next/image";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

type FileUploadProps = {
  label?: string;
  onFileChange: (files: File[]) => void; // Ensure it's always an array
};

const FileUploadVideo: React.FC<FileUploadProps> = ({
  label = "File",
  onFileChange,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setSelectedFiles((prevFiles) => {
        const newFiles = [...prevFiles, ...acceptedFiles];
        onFileChange(newFiles); // Ensure state and parent component are updated
        return newFiles;
      });
    },
    [onFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".mkv", ".webm"],
    },
    multiple: true,
  });

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        {...getRootProps()}
        className={cn(
          "bg-pageColor rounded-md p-4 flex flex-col items-center justify-center text-center cursor-pointer",
          isDragActive && "border-blue-500 bg-blue-50"
        )}
      >
        <Input
          {...getInputProps()}
          className="hidden"
          type="file"
          multiple={true}
        />
        <Image
          src="/assets/upload-file.svg"
          alt="upload"
          width={130}
          height={130}
        />
        {/* Display selected file count */}
        {selectedFiles.length > 0 && (
          <p className="text-green-500 text-sm mt-2">
            {selectedFiles.length} file(s) selected
          </p>
        )}
      </div>
    </div>
  );
};

export default FileUploadVideo;
