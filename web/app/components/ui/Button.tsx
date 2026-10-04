import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "dark" | "outline" | "disabled";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-lemon-600 text-white hover:bg-lemon-700",
  dark: "bg-ink text-white hover:bg-ash-800",
  outline: "bg-white border border-ash-400 text-ink hover:border-ink",
  disabled: "bg-ash-200 text-ash-600 cursor-not-allowed",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-5 py-3 text-[15px]",
  lg: "px-6 py-4 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={`font-sans font-semibold rounded-[10px] transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
