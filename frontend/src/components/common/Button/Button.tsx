import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium " +
    "transition-all duration-200 shadow-sm hover:shadow-md " +
    "disabled:opacity-50 disabled:pointer-events-none " +
    "focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white hover:bg-primary/90 " +
          "focus:ring-primary/30",
        outline:
          "border-2 border-gray-200 bg-white text-gray-700 " +
          "hover:border-primary hover:text-primary " +
          "focus:ring-primary/30",
        ghost:
          "text-gray-700 hover:bg-gray-100 hover:text-primary " +
          "focus:ring-gray-200",
        secondary:
          "bg-secondary text-white hover:bg-secondary/90 " +
          "focus:ring-secondary/30",
        accent:
          "bg-accent text-white hover:bg-accent/90 " + "focus:ring-accent/30",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 " +
          "focus:ring-destructive/30",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-8 px-3 text-xs",
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      loading: {
        true: "opacity-70 cursor-wait",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      fullWidth: false,
      loading: false,
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({
            variant,
            size,
            fullWidth,
            loading,
          }),
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="mr-2 inline-block animate-spin">⚪</span>
        ) : leftIcon ? (
          <span className="mr-2">{leftIcon}</span>
        ) : null}

        {children}

        {rightIcon && !loading && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
export type { ButtonProps };
