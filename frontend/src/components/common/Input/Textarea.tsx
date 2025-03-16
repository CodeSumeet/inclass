import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  errorMessage?: string;
  className?: string;
}

const Textarea: React.FC<TextareaProps> = ({
  label,
  errorMessage,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className="block mb-2 text-sm font-medium">{label}</label>
      )}
      <textarea
        className={cn(
          "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
          errorMessage && "border-red-500",
          className
        )}
        {...props}
      />
      {errorMessage && (
        <div className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Textarea;
