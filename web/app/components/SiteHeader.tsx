import Link from "next/link";
import Image from "next/image";
import { AuthStatus } from "./AuthStatus";
import { NavLink } from "./NavLink";

const links = [
  { href: "/farm", label: "Farm" },
  { href: "/eatery", label: "Eatery" },
  { href: "/studio", label: "Studio" },
  { href: "/track", label: "Track Order" },
];

export function SiteHeader() {
  return (
    <header className="bg-ink text-white sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0" aria-label="Alaba Dorf home">
          <Image
            src="/logo.png"
            alt="Alaba Dorf Outlet logo"
            width={34}
            height={34}
            className="rounded-full bg-white"
            priority
          />
          <span className="hidden min-[420px]:block font-display text-lg leading-none font-semibold">
            Alaba Dorf
            <span className="block text-[10px] font-sans font-medium tracking-[0.18em] uppercase text-ash-200">
              Outlet
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 ml-auto overflow-x-auto py-1">
          {links.map((l) => (
            <NavLink key={l.href} href={l.href}>
              {l.label}
            </NavLink>
          ))}
          <span className="flex-shrink-0">
            <AuthStatus />
          </span>
        </nav>
      </div>
    </header>
  );
}
