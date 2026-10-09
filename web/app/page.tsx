import Link from "next/link";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { Button } from "./components/ui/Button";
import { FarmArt, EateryArt, StudioArt } from "./components/HomeArt";
import { prisma } from "@/lib/prisma";
import { koboToNaira } from "@/lib/format";

export const dynamic = "force-dynamic";

async function livePrices(): Promise<{ egg: string | null; studio: string | null }> {
  try {
    const [inv, basic] = await Promise.all([
      prisma.eggInventory.findUnique({ where: { id: "eggs" } }),
      prisma.sessionType.findFirst({
        where: { active: true },
        orderBy: { price: "asc" },
      }),
    ]);
    return {
      egg: inv && inv.pricePerCrate > 0 ? koboToNaira(inv.pricePerCrate) : null,
      studio:
        basic && basic.price > 0 ? `from ${koboToNaira(basic.price)}` : null,
    };
  } catch {
    return { egg: null, studio: null };
  }
}

const steps = [
  { title: "Choose what you need", desc: "Eggs, meat, poultry, food or a studio slot." },
  { title: "Enter your details", desc: "Name, phone number, and address for delivery." },
  { title: "Pay your way", desc: "Cash on delivery, bank transfer or card." },
  { title: "Track your order", desc: "Follow it to collection or delivery." },
];

export default async function Home() {
  const prices = await livePrices();

  const departments = [
    {
      href: "/farm",
      name: "Farm Products",
      tag: "Eggs · Meat · Poultry",
      desc: "Crates of fresh eggs, kilos of cow or pig, and live or dressed turkey and broiler — reserved in your name.",
      items: ["Eggs by the crate", "Cow & pig portions", "Turkey & broiler"],
      cta: "Explore Products",
      img: "/gallery/eggs-crates.jpg",
      art: <FarmArt className="w-full h-auto block" />,
      price: prices.egg ? `Eggs ${prices.egg}/crate` : null,
    },
    {
      href: "/eatery",
      name: "Eatery",
      tag: "Hot Food, Ready Fast",
      desc: "Jollof rice, fried rice, chicken and more. Pay your way, then collect your meal or have it delivered.",
      items: ["Jollof rice", "Fried rice", "Grilled chicken"],
      cta: "View Menu",
      img: "/gallery/jollof-plate.jpg",
      art: <EateryArt className="w-full h-auto block" />,
      price: null,
    },
    {
      href: "/studio",
      name: "Photo Studio",
      tag: "Sessions & Bookings",
      desc: "Family portraits, business photos and event coverage. Pick a session and a free slot — never double-booked.",
      items: ["Basic & premium sessions", "Live availability calendar", "Instant confirmation"],
      cta: "Book a Session",
      img: "/gallery/studio-room.jpg",
      art: <StudioArt className="w-full h-auto block" />,
      price: prices.studio ? `Sessions ${prices.studio}` : null,
    },
  ];

  return (
    <>
      <SiteHeader />
      <main className="w-full">
        {/* Hero */}
        <section className="bg-lemon-600 text-white overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
            <div className="max-w-2xl">
              <p className="inline-block text-xs font-bold tracking-[0.16em] uppercase bg-ink/25 rounded-full px-3 py-1.5">
                Alaba Dorf Outlet · Farm, Food &amp; Photos
              </p>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] mt-4">
                Farm-fresh food and memorable photos, ordered in minutes.
              </h1>
              <p className="mt-4 max-w-lg text-white/90 text-base sm:text-lg">
                Eggs, meat and poultry from our farm, hot meals from our
                kitchen, and professional photo sessions — pay cash on
                delivery, by transfer or by card, then collect or have it
                delivered.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/farm">
                  <Button
                    variant="outline"
                    size="lg"
                    className="!bg-white !border-white !text-ink hover:!bg-ash-100"
                  >
                    Explore Products
                  </Button>
                </Link>
                <Link href="/track">
                  <Button variant="dark" size="lg">
                    Track Your Order
                  </Button>
                </Link>
              </div>
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/90">
                {["Secure online payment", "Cash on delivery", "No account needed"].map(
                  (t) => (
                    <li key={t} className="flex items-center gap-1.5">
                      <span className="inline-flex w-4 h-4 rounded-full bg-white text-lemon-800 text-[10px] font-bold items-center justify-center">
                        ✓
                      </span>
                      {t}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="max-w-5xl mx-auto px-4 mt-8 sm:mt-12">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold">
              Everything Alaba Dorf offers, in one place
            </h2>
            <p className="text-ash-600 mt-2">
              Three departments, one account-free checkout, live stock and
              honest prices.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            {departments.map((d) => (
              <article
                key={d.href}
                className="bg-white border border-ash-200 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(20,22,16,0.10)] hover:border-lemon-600"
              >
                {d.img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={d.img}
                    alt={d.name}
                    className="w-full aspect-[16/10] object-cover block"
                    loading="lazy"
                  />
                ) : (
                  d.art
                )}
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs font-bold tracking-[0.14em] uppercase text-lemon-800">
                    {d.tag}
                  </p>
                  <h3 className="font-display text-2xl font-semibold mt-1">
                    {d.name}
                  </h3>
                  {d.price ? (
                    <p className="text-sm font-bold text-ink mt-1">{d.price}</p>
                  ) : null}
                  <p className="text-[15px] text-ash-600 mt-2 flex-1">
                    {d.desc}
                  </p>
                  <ul className="mt-3 mb-4 space-y-1">
                    {d.items.map((it) => (
                      <li
                        key={it}
                        className="text-sm text-ash-600 flex items-center gap-2"
                      >
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-lemon-600 flex-shrink-0" />
                        {it}
                      </li>
                    ))}
                  </ul>
                  <Link href={d.href}>
                    <Button variant="outline" className="w-full">
                      {d.cta}
                    </Button>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-5xl mx-auto px-4 mt-10 sm:mt-14">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold">
            Ordering takes about five minutes
          </h2>
          <ol className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className="rounded-xl border border-ash-200 bg-white p-4"
              >
                <span className="inline-flex w-7 h-7 rounded-full bg-ink text-white text-sm font-bold items-center justify-center">
                  {i + 1}
                </span>
                <p className="font-bold mt-2 text-[15px]">{s.title}</p>
                <p className="text-sm text-ash-600 mt-0.5">{s.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Tracking */}
        <section className="max-w-5xl mx-auto px-4 mt-8 mb-2">
          <div className="bg-lemon-100 border border-lemon-600 rounded-2xl px-5 py-5 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-display text-2xl font-semibold">
                Already ordered? See exactly where it is.
              </h2>
              <p className="text-ash-600 text-sm mt-1">
                Your order number plus the phone number you ordered with — no
                account, no phone calls needed.
              </p>
            </div>
            <Link href="/track" className="shrink-0">
              <Button>Track Order</Button>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
