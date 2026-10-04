import Link from "next/link";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { Button } from "./components/ui/Button";
import { Card } from "./components/ui/Card";

const departments = [
  {
    href: "/farm",
    name: "Farm",
    desc: "Eggs by the crate and shared cow & pig portions.",
    cta: "Shop the Farm",
  },
  {
    href: "/eatery",
    name: "Eatery",
    desc: "Hot food, priced per plate. Pay online, pickup or delivery.",
    cta: "See the Menu",
  },
  {
    href: "/studio",
    name: "Photo Studio",
    desc: "Book a session type and pick an open time slot.",
    cta: "Book a Session",
  },
];

const steps = [
  "Pick what you want — eggs, meat, food or a studio slot.",
  "Enter your name, phone and pickup or delivery details.",
  "Pay securely online. No screenshots, no stories.",
  "Track your order with your order number.",
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-4 w-full">
        <section className="bg-lemon-600 text-white rounded-xl px-6 py-10 sm:px-10 sm:py-14 mt-4">
          <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight max-w-xl">
            Farm fresh, delivered or picked up.
          </h1>
          <p className="mt-3 max-w-lg text-white/90">
            Eggs, shared meat, hot food and photo sessions — one outlet, one
            simple ordering flow.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/farm">
              <Button
                variant="outline"
                className="!bg-white !border-white !text-ink"
              >
                Shop the Farm
              </Button>
            </Link>
            <Link href="/track">
              <Button variant="dark">Track an Order</Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3 mt-4">
          {departments.map((d) => (
            <Card key={d.href}>
              <h2 className="font-display text-2xl font-semibold">{d.name}</h2>
              <p className="text-ash-600 text-sm mt-1 mb-4">{d.desc}</p>
              <Link href={d.href}>
                <Button variant="outline" size="sm">
                  {d.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </section>

        <Card title="How ordering works" className="mt-4">
          <ol className="mt-2 space-y-3">
            {steps.map((s, i) => (
              <li key={s} className="flex gap-3 text-[15px]">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-ink text-white text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
