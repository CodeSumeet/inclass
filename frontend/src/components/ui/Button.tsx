import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

// Define Button Variants
const buttonVariants = cva(
  "px-4 py-2 rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 w-fit",
  {
    variants: {
      variant: {
        filled:
          "text-white bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80",
        outline: "border border-secondary text-secondary hover:bg-secondary/10",
      },
      size: {
        sm: "px-3 py-1 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
      },
      fullWidth: {
        true: "w-full", // Takes full width if true
        false: "w-fit", // Default behavior: button width depends on content
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "md",
      fullWidth: false,
    },
  }
);

// Button Props Type
interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

// Forward Ref for Better Accessibility
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
