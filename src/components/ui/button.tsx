import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const baseStyles =
  "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-xl text-base font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 px-6 py-3 active:scale-95 hover:shadow-lg";

const variantStyles = {
  ok: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:-translate-y-0.5",
  cancel: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border shadow-sm",
  back: "bg-background text-primary hover:bg-muted border-2 border-primary shadow-sm hover:shadow-md",
} as const;

type ButtonVariant = keyof typeof variantStyles;

// Export buttonVariants for use in other components (like alert-dialog)
export const buttonVariants = cva(baseStyles, {
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
});

const Button = ({
  variant = "ok",
  className,
  ...props
}: React.ComponentProps<"button"> & { variant?: ButtonVariant }) => (
  <button className={cn(baseStyles, variantStyles[variant], className)} {...props} />
);

export { Button };
