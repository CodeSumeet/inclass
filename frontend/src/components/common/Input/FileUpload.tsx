import { useState } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

type FileUploadProps = {
  label?: string;
  errorMessage?: string;
  className?: string;
  onChange: (file: File | null) => void; // Callback to handle file change
};

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  errorMessage,
  className,
  onChange,
}) => {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFileName(file ? file.name : null);
    onChange(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0] || null;
    setFileName(file ? file.name : null);
    onChange(file);
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
          <span className="text-gray-700">{fileName}</span>
        ) : (
          <span className="text-gray-400">
            Drag & drop your file here or click to select
          </span>
        )}
        <input
          id="file-input"
          type="file"
          className="hidden"
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
