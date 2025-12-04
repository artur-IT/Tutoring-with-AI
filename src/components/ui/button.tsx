import * as React from "react";

const baseStyles =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 px-4 py-2";

const variantStyles = {
  ok: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
  cancel: "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300",
  back: " bg-white text-blue-600 hover:bg-blue-50 border border-blue-600",
} as const;

type ButtonVariant = keyof typeof variantStyles;

function Button({
  variant = "ok",
  ...props
}: React.ComponentProps<"button"> & {
  variant?: ButtonVariant;
}) {
  return <button className={`${baseStyles} ${variantStyles[variant]}`} {...props} />;
}

export { Button };
