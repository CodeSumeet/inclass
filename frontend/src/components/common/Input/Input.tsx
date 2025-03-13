import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

type InputProps = {
  label?: string;
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
    "w-full min-w-0 px-4 py-3 text-sm bg-white " +
    "rounded-lg border transition-all duration-200 " +
    "placeholder:text-gray-400 focus:outline-none " +
    "shadow-sm hover:shadow-md";

  const variants = {
    default:
      "border-gray-200 hover:border-primary/50 focus:border-primary " +
      "focus:ring-2 focus:ring-primary/20",
    outlined:
      "border-gray-200 hover:border-primary/50 focus:border-primary " +
      "focus:ring-2 focus:ring-primary/20",
    filled:
      "bg-gray-50 border-gray-200 hover:border-primary/50 " +
      "focus:border-primary focus:ring-2 focus:ring-primary/20",
    error:
      "border-red-300 bg-red-50 text-red-900 " +
      "placeholder:text-red-300 focus:border-red-500 " +
      "focus:ring-2 focus:ring-red-200",
  };

  const labelStyles = cn(
    "block mb-2 text-sm font-medium",
    variant === "error" ? "text-red-600" : "text-gray-700"
  );

  return (
    <div className="flex flex-col w-full">
      <label
        htmlFor={label?.replace(/\s+/g, "-").toLowerCase()}
        className={labelStyles}
      >
        {label}
      </label>

      <div className="relative flex items-center">
        {icon && <span className="absolute left-4 text-gray-500">{icon}</span>}

        <input
          id={label?.replace(/\s+/g, "-").toLowerCase()}
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
        <div className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Input;
