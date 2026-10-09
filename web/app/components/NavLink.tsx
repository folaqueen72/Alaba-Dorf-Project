"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({
  href,
  children,
  exact = false,
}: {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex-shrink-0 px-2 sm:px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${
        active ? "bg-lemon-600 text-white" : "hover:bg-ash-800"
      }`}
    >
      {children}
    </Link>
  );
}

export function AdminNavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`px-3 py-2 rounded-lg whitespace-nowrap text-sm font-semibold ${
        active ? "bg-lemon-600 text-white" : "hover:bg-ash-800"
      }`}
    >
      {children}
    </Link>
  );
}
