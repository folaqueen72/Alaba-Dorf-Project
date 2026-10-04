import Link from "next/link";
import Image from "next/image";

const links = [
  { href: "/farm", label: "Farm" },
  { href: "/eatery", label: "Eatery" },
  { href: "/studio", label: "Studio" },
  { href: "/track", label: "Track Order" },
];

export function SiteHeader() {
  return (
    <header className="bg-ink text-white sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Alaba Dorf Outlet logo"
            width={40}
            height={40}
            className="rounded-full bg-white"
            priority
          />
          <span className="font-display text-xl font-semibold leading-none">
            Alaba Dorf
            <span className="block text-[11px] font-sans font-medium tracking-[0.18em] uppercase text-ash-200">
              Outlet
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 text-sm font-semibold">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-2 sm:px-3 py-2 rounded-lg hover:bg-ash-800"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
