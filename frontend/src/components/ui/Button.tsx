import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none",
  {
    variants: {
      variant: {
        filled:
          "border border-black bg-gradient-to-r from-primary to-secondary text-primary-foreground " +
          "hover:bg-gradient-to-r hover:from-primary/90 hover:to-secondary/90 " +
          "active:opacity-80 focus:ring-primary",

        outline:
          "border border-black text-foreground " +
          "hover:bg-gray-100 hover:text-accent " +
          "active:opacity-80 focus:ring-accent",

        ghost:
          "text-foreground hover:bg-accent/10 hover:text-accent " +
          "active:opacity-80 focus:ring-accent",
      },
      size: {
        sm: "px-4 py-1.5 text-sm h-9",
        md: "px-6 py-2.5 text-base h-11",
        lg: "px-8 py-3.5 text-lg h-14",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "md",
      fullWidth: false,
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        aria-label={!children ? "Button" : undefined}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
