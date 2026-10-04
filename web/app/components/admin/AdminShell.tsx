import Link from "next/link";
import type { ReactNode } from "react";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/animals", label: "Animals" },
  { href: "/admin/studio", label: "Studio" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/activity", label: "Activity" },
  { href: "/admin/users", label: "Admins" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen sm:grid sm:grid-cols-[220px_1fr]">
      <aside className="bg-ink text-white">
        <div className="px-4 py-4">
          <Link href="/admin" className="font-display text-lg font-semibold">
            Alaba Dorf · Admin
          </Link>
        </div>
        <nav className="flex sm:flex-col gap-1 px-3 pb-4 overflow-x-auto text-sm font-semibold">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="px-3 py-2 rounded-lg hover:bg-ash-800 whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="p-4 sm:p-6 max-w-5xl w-full">{children}</main>
    </div>
  );
}
