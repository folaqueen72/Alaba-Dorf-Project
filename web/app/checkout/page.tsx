import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

const STEPS = [
  "Review order",
  "Enter customer details",
  "Choose pickup / delivery",
  "Review total",
  "Make payment",
  "Receive confirmation",
];

export default function CheckoutPage() {
  return (
    <>
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-4 w-full">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-6 mb-1">
          Checkout
        </h1>
        <p className="text-ash-600 mb-4">
          Six short steps. Online payment only — no pay on delivery.
        </p>

        <div className="grid gap-4 sm:grid-cols-[1fr_280px]">
          <Card title="Step 1 — Review order">
            <p className="text-sm text-ash-600 mt-1">
              Live checkout with payment arrives in Phase 3. This screen shows
              the agreed flow:
            </p>
            <ol className="mt-3 space-y-2">
              {STEPS.map((s, i) => (
                <li key={s} className="flex gap-3 text-[15px]">
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center ${
                      i === 0
                        ? "bg-lemon-600 text-white"
                        : "bg-white border border-ash-400 text-ash-600"
                    }`}
                  >
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </Card>
          <Card title="Your details">
            <div className="space-y-3 mt-2">
              <Input label="Full name" placeholder="Adeola Balogun" />
              <Input label="Phone number" placeholder="0803 000 0000" />
              <Button className="w-full">Continue</Button>
            </div>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
