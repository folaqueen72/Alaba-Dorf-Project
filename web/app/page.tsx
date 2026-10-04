import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { Button } from "./components/ui/Button";
import { EggIcon, FoodIcon, CameraIcon } from "./components/DeptIcons";

const departments = [
  {
    href: "/farm",
    name: "Farm",
    tag: "Eggs & Meat Sharing",
    desc: "Crates of fresh eggs, and kilos of cow or pig reserved in your name. Stock is limited, so early booking is advised.",
    cta: "Buy Farm Produce",
    icon: <EggIcon />,
  },
  {
    href: "/eatery",
    name: "Eatery",
    tag: "Hot Food, Ready Fast",
    desc: "Jollof rice, fried rice, chicken and more. Pay online once, then collect your meal or have it delivered.",
    cta: "View the Menu",
    icon: <FoodIcon />,
  },
  {
    href: "/studio",
    name: "Photo Studio",
    tag: "Sessions & Bookings",
    desc: "Family portraits, business photos and event coverage. Choose a session and a free time slot — no double bookings.",
    cta: "Book a Session",
    icon: <CameraIcon />,
  },
];

const steps = [
  { title: "Choose what you need", desc: "Eggs, meat, food or a studio slot." },
  { title: "Enter your details", desc: "Name, phone number, and address for delivery." },
  { title: "Pay securely online", desc: "Card, transfer or USSD in under a minute." },
  { title: "Track your order", desc: "Follow it to collection or delivery." },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="w-full">
        {/* Hero */}
        <section className="bg-lemon-600 text-white">
          <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14 grid gap-6 sm:grid-cols-[1fr_auto] items-center">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.08]">
                Fresh farm produce, without the stress.
              </h1>
              <p className="mt-3 max-w-lg text-white/90">
                Buy eggs by the crate, reserve kilos of cow or pig, order hot
                food, or book the photo studio. Pay online, then collect your
                order or have it delivered.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/farm">
                  <Button
                    variant="outline"
                    size="lg"
                    className="!bg-white !border-white !text-ink hover:!bg-ash-100"
                  >
                    Buy Farm Produce
                  </Button>
                </Link>
                <Link href="/track">
                  <Button variant="dark" size="lg">
                    Track Your Order
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-sm text-white/80">
                Secure online payment · No account needed ·{" "}
                <Link href="/login" className="underline underline-offset-4">
                  Sign in
                </Link>{" "}
                to skip typing your details every time.
              </p>
            </div>
            <div className="hidden sm:block">
              <Image
                src="/logo.png"
                alt="Alaba Dorf Outlet badge"
                width={220}
                height={220}
                className="rounded-full transition-transform duration-500 hover:rotate-3"
                priority
              />
            </div>
          </div>
        </section>

        {/* Departments */}
        <section className="max-w-5xl mx-auto px-4 mt-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {departments.map((d) => (
              <article
                key={d.href}
                className="bg-white border border-ash-200 rounded-2xl p-5 flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(20,22,16,0.10)] hover:border-lemon-600"
              >
                <span className="inline-flex w-12 h-12 rounded-full bg-lemon-100 text-lemon-800 items-center justify-center">
                  {d.icon}
                </span>
                <p className="text-xs font-bold tracking-[0.14em] uppercase text-ash-600 mt-3">
                  {d.tag}
                </p>
                <h2 className="font-display text-2xl font-semibold">
                  {d.name}
                </h2>
                <p className="text-[15px] text-ash-600 mt-1 mb-4 flex-1">
                  {d.desc}
                </p>
                <Link href={d.href}>
                  <Button variant="outline" className="w-full">
                    {d.cta}
                  </Button>
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-5xl mx-auto px-4 mt-10">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold">
            How it works
          </h2>
          <ol className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
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
        <section className="max-w-5xl mx-auto px-4 mt-8">
          <div className="bg-lemon-100 border border-lemon-600 rounded-2xl px-5 py-5 flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="flex-1 font-semibold">
              Already placed an order? Enter your order number and phone
              number to see exactly where it is.
            </p>
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
