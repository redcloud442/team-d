import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils"; // Utility for merging classes, or replace with classNames if preferred
import { Upload } from "lucide-react"; // Icon for better UI
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

type FileUploadProps = {
  label?: string;
  onFileChange: (file: File | null) => void;
};

const FileUpload: React.FC<FileUploadProps> = ({
  label = "File",
  onFileChange,
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFileChange(acceptedFiles[0] || null);
    },
    [onFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    multiple: false,
  });

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center text-center cursor-pointer",
          isDragActive && "border-blue-500 bg-blue-50"
        )}
      >
        <Input {...getInputProps()} className="hidden" type="file" />
        <Upload className="h-10 w-10 text-gray-400" />
        <p className="text-gray-500">Drag and drop a file or click to browse</p>
        <p className="text-sm text-gray-400">PDF, image, video, or audio</p>
      </div>
    </div>
  );
};

export default FileUpload;
