import type { ReactNode } from "react";

export function Alert({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="border border-lemon-800 bg-lemon-100 rounded-[10px] p-3 text-sm">
      <p className="font-bold text-lemon-800">{title}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
