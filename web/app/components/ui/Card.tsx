import type { ReactNode } from "react";

export function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`bg-white border border-ash-200 rounded-xl p-5 ${className}`}
    >
      {title ? (
        <h2 className="font-display text-2xl font-semibold mb-1">{title}</h2>
      ) : null}
      {children}
    </section>
  );
}
