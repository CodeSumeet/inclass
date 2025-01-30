import { cn } from "../../lib/utils";
import React from "react";
import { AlertCircle } from "lucide-react";

type InputProps = {
  label: string;
  type?: "text" | "password" | "email" | "number" | "tel" | "url" | "search";
  variant?: "default" | "outlined" | "filled" | "error";
  className?: string;
  errorMessage?: string;
  icon?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>;

const Input: React.FC<InputProps> = ({
  label,
  type = "text",
  variant = "default",
  className,
  errorMessage,
  icon,
  ...props
}) => {
  const baseStyles =
    "w-full min-w-0 px-4 py-3 text-md placeholder-gray-600 font-medium rounded-full focus:outline-none transition-all duration-200";

  const variants = {
    default:
      "border border-gray-300 bg-white text-black focus:ring-2 focus:ring-black focus:border-black",
    outlined:
      "border border-black bg-transparent text-black focus:ring-2 focus:ring-black",
    filled:
      "bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:ring-2 focus:ring-white",
    error:
      "border border-red-500 text-red-600 bg-red-100 focus:ring-2 focus:ring-red-500",
  };

  return (
    <div className="flex flex-col w-full">
      <label
        htmlFor={label.replace(/\s+/g, "-").toLowerCase()}
        className="mb-1 text-md font-medium text-gray-700"
      >
        {label}
      </label>

      <div className="relative flex items-center">
        {icon && <span className="absolute left-4 text-gray-500">{icon}</span>}

        <input
          id={label.replace(/\s+/g, "-").toLowerCase()}
          type={type}
          className={cn(
            baseStyles,
            variant === "error" && errorMessage
              ? variants["error"]
              : variants[variant],
            icon ? "pl-12" : "",
            className
          )}
          {...props}
        />
      </div>

      {errorMessage && (
        <p className="mt-2 text-sm text-red-500 flex items-center gap-1 animate-fade-in">
          <AlertCircle size={16} />
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default Input;
