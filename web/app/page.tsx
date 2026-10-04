import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { Button } from "./components/ui/Button";

const departments = [
  {
    href: "/farm",
    name: "Farm",
    tag: "Eggs & Meat Sharing",
    desc: "Crates of fresh eggs, plus kilos of cow or pig reserved in your own name. When e finish, e finish — so book early.",
    cta: "Shop the Farm",
    tint: "bg-lemon-50",
  },
  {
    href: "/eatery",
    name: "Eatery",
    tag: "Hot Food, Ready Fast",
    desc: "Jollof, fried rice, chicken and more. Pay online once, then pick up or we bring am come meet you.",
    cta: "See the Menu",
    tint: "bg-white",
  },
  {
    href: "/studio",
    name: "Photo Studio",
    tag: "Sessions & Bookings",
    desc: "Family pictures, business portraits, events. Pick your session and choose a free slot — your time no go clash with another person own.",
    cta: "Book a Session",
    tint: "bg-ash-100",
  },
];

const assurances = [
  {
    title: "Pay online, rest your mind",
    desc: "Card, transfer or USSD through Paystack. No screenshot, no story.",
  },
  {
    title: "No account needed",
    desc: "Just your name and phone number. Your order number is your receipt.",
  },
  {
    title: "Track everything",
    desc: "From payment to ready to delivered — check your order anytime.",
  },
];

const steps = [
  { title: "Pick wetin you want", desc: "Eggs, meat kilos, food or a studio slot." },
  { title: "Drop name and number", desc: "Plus address if you want delivery." },
  { title: "Pay online", desc: "Secure payment in under a minute." },
  { title: "Track am reach your hand", desc: "Follow your order number to pickup or delivery." },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="w-full">
        {/* Hero */}
        <section className="bg-lemon-600 text-white overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16 grid gap-8 sm:grid-cols-[1fr_auto] items-center">
            <div>
              <p className="inline-block text-xs font-bold tracking-[0.16em] uppercase bg-ink/25 rounded-full px-3 py-1.5">
                Alaba Dorf Outlet · Farm, Food &amp; Photos
              </p>
              <h1 className="font-display text-4xl sm:text-6xl font-semibold leading-[1.05] mt-4">
                Fresh from our farm, without the stress.
              </h1>
              <p className="mt-4 max-w-lg text-white/90 text-base sm:text-lg">
                Buy eggs by the crate, reserve your own kilos of cow or pig,
                order hot food, or book the photo studio. Pay online, then
                pick up or let us deliver. No long talk.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/farm">
                  <Button
                    variant="outline"
                    size="lg"
                    className="!bg-white !border-white !text-ink hover:!bg-ash-100"
                  >
                    Shop the Farm
                  </Button>
                </Link>
                <Link href="/track">
                  <Button variant="dark" size="lg">
                    Track Your Order
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden sm:block">
              <Image
                src="/logo.png"
                alt="Alaba Dorf Outlet badge"
                width={240}
                height={240}
                className="rounded-full bg-white/10 p-2 transition-transform duration-500 hover:rotate-3"
                priority
              />
            </div>
          </div>
        </section>

        {/* Assurances */}
        <section className="max-w-5xl mx-auto px-4 grid gap-3 sm:grid-cols-3 -mt-0 pt-6">
          {assurances.map((a) => (
            <div
              key={a.title}
              className="bg-white border border-ash-200 rounded-xl p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(20,22,16,0.08)]"
            >
              <p className="font-bold">{a.title}</p>
              <p className="text-sm text-ash-600 mt-1">{a.desc}</p>
            </div>
          ))}
        </section>

        {/* Departments */}
        <section className="max-w-5xl mx-auto px-4 mt-10">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold">
            Wetin you dey find?
          </h2>
          <p className="text-ash-600 mt-1 mb-5">
            Three shops, one roof. Enter any one straight.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {departments.map((d) => (
              <article
                key={d.href}
                className={`${d.tint} border border-ash-200 rounded-2xl p-6 flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(20,22,16,0.10)] hover:border-lemon-600`}
              >
                <p className="text-xs font-bold tracking-[0.14em] uppercase text-lemon-800">
                  {d.tag}
                </p>
                <h3 className="font-display text-3xl font-semibold mt-1">
                  {d.name}
                </h3>
                <p className="text-[15px] text-ash-600 mt-2 mb-5 flex-1">
                  {d.desc}
                </p>
                <Link href={d.href}>
                  <Button variant="outline" className="w-full bg-white">
                    {d.cta}
                  </Button>
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mt-10 bg-ink text-white">
          <div className="max-w-5xl mx-auto px-4 py-10">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold">
              How e dey work
            </h2>
            <p className="text-ash-200 mt-1 mb-6">
              Four steps, five minutes. Nobody go stress you.
            </p>
            <ol className="grid gap-4 sm:grid-cols-4">
              {steps.map((s, i) => (
                <li
                  key={s.title}
                  className="rounded-xl border border-ash-800 p-4 transition-colors duration-200 hover:border-lemon-600"
                >
                  <span className="inline-flex w-8 h-8 rounded-full bg-lemon-600 text-white text-sm font-bold items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="font-bold mt-2">{s.title}</p>
                  <p className="text-sm text-ash-200 mt-1">{s.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Tracking CTA */}
        <section className="max-w-5xl mx-auto px-4 mt-10">
          <div className="bg-lemon-100 border border-lemon-600 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold">
                Already order? Check am.
              </h2>
              <p className="text-ash-600 mt-1">
                Put your order number and phone number, see exactly where
                your order dey — paid, preparing, ready, or on the road.
              </p>
            </div>
            <Link href="/track" className="shrink-0">
              <Button size="lg">Track Order</Button>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
