import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const baseStyles =
  "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-lg text-base font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 px-4 py-2";

const variantStyles = {
  ok: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
  cancel: "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300",
  back: "h-[40px] bg-white text-blue-600 hover:bg-blue-50 border border-blue-600",
} as const;

type ButtonVariant = keyof typeof variantStyles;

// Export buttonVariants for use in other components (like alert-dialog)
export const buttonVariants = cva(
  baseStyles,
  {
    variants: {
      variant: {
        default: variantStyles.ok,
        outline: variantStyles.cancel,
        ok: variantStyles.ok,
        cancel: variantStyles.cancel,
        back: variantStyles.back,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Button = ({ variant = "ok", className, ...props }: React.ComponentProps<"button"> & { variant?: ButtonVariant }) =>
  <button className={cn(baseStyles, variantStyles[variant], className)} {...props} />;

export { Button };
