import type { InputHTMLAttributes } from "react";

export function Input({
  label,
  hint,
  error,
  id,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
}) {
  const inputId = id ?? label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <label htmlFor={inputId} className="block">
      <span className="block text-sm font-semibold mb-1">{label}</span>
      <input
        id={inputId}
        className={`w-full rounded-[10px] border bg-white px-4 py-3 text-[15px] outline-none focus:border-lemon-600 ${
          error ? "border-ink" : "border-ash-400"
        } ${className}`}
        {...props}
      />
      {error ? (
        <span className="block text-sm mt-1 font-semibold">{error}</span>
      ) : hint ? (
        <span className="block text-sm mt-1 text-ash-600">{hint}</span>
      ) : null}
    </label>
  );
}
