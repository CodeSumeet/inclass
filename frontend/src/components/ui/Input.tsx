import { cn } from "../../lib/utils";
import React from "react";

type InputProps = {
  label: string;
  type?: "text" | "password" | "email" | "number" | "tel" | "url" | "search";
  variant?: "default" | "outlined" | "filled" | "error";
  className?: string;
  errorMessage?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const Input: React.FC<InputProps> = ({
  label,
  type = "text",
  variant = "default",
  className,
  errorMessage,
  ...props
}) => {
  const baseStyles =
    "w-full min-w-0 px-4 py-3 text-md placeholder-black font-medium rounded-full focus:outline-none transition-all duration-200";

  const variants = {
    default:
      "border border-black bg-white text-black focus:ring-2 focus:ring-black",
    outlined:
      "border-2 border-black bg-transparent text-black focus:ring-2 focus:ring-black",
    filled:
      "bg-gray-800 text-white placeholder-white border border-gray-700 focus:ring-2 focus:ring-white",
    error:
      "border border-red-500 text-red-600 bg-red-100 focus:ring-2 focus:ring-red-500",
  };

  return (
    <div className="flex flex-col w-full">
      <label
        htmlFor={label.replace(/\s+/g, "-").toLowerCase()}
        className="mb-1 text-black font-medium"
      >
        {label}
      </label>
      <input
        id={label.replace(/\s+/g, "-").toLowerCase()}
        type={type}
        className={cn(
          baseStyles,
          variant === "error" && errorMessage
            ? variants["error"]
            : variants[variant],
          className
        )}
        {...props}
      />
      {errorMessage && (
        <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
      )}
    </div>
  );
};

export default Input;
