import { useState } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, FileText, Image, Video, File } from "lucide-react";

type FileUploadProps = {
  label?: string;
  errorMessage?: string;
  className?: string;
  onChange: (file: File | null) => void;
  accept?: string; // Add accept prop to restrict file types
};

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  errorMessage,
  className,
  onChange,
  accept = "*", // Default to all files
}) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFileName(file ? file.name : null);
    setFileType(file ? file.type : null);
    onChange(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0] || null;
    setFileName(file ? file.name : null);
    setFileType(file ? file.type : null);
    onChange(file);
  };

  // Get appropriate icon based on file type
  const getFileIcon = () => {
    if (!fileType) return <File className="h-6 w-6 text-gray-400" />;

    if (fileType.startsWith("image/")) {
      return <Image className="h-6 w-6 text-purple-500" />;
    } else if (fileType.startsWith("video/")) {
      return <Video className="h-6 w-6 text-red-500" />;
    } else if (
      fileType.includes("pdf") ||
      fileType.includes("word") ||
      fileType.includes("excel") ||
      fileType.includes("powerpoint") ||
      fileType.includes("text/")
    ) {
      return <FileText className="h-6 w-6 text-blue-500" />;
    }

    return <File className="h-6 w-6 text-gray-500" />;
  };

  return (
    <div className={cn("flex flex-col w-full", className)}>
      {label && (
        <label className="block mb-2 text-sm font-medium">{label}</label>
      )}
      <div
        className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        {fileName ? (
          <div className="flex items-center">
            {getFileIcon()}
            <span className="text-gray-700 ml-2">{fileName}</span>
          </div>
        ) : (
          <span className="text-gray-400">
            Drag & drop your file here or click to select
          </span>
        )}
        <input
          id="file-input"
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
        />
      </div>
      {errorMessage && (
        <div className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
