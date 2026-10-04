import Link from "next/link";

const links = [
  { href: "/farm", label: "Farm" },
  { href: "/eatery", label: "Eatery" },
  { href: "/studio", label: "Studio" },
  { href: "/track", label: "Track Order" },
];

export function SiteHeader() {
  return (
    <header className="bg-ink text-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="font-display text-xl font-semibold">
          Alaba Dorf
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
