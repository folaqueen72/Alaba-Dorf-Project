"use client";

import { useState } from "react";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";

const TIMELINE = [
  { label: "Order received", done: true },
  { label: "Payment confirmed", done: true },
  { label: "Preparing", done: true },
  { label: "Ready for pickup", done: false },
  { label: "Completed", done: false },
];

export default function TrackPage() {
  const [lookedUp, setLookedUp] = useState(false);

  return (
    <>
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-4 w-full">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-6 mb-1">
          Track your order
        </h1>
        <p className="text-ash-600 mb-4">
          Enter your order number and phone number. No account needed.
        </p>

        <Card>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Order number" placeholder="#ADO1042" />
            <Input label="Phone number" placeholder="0803 000 0000" />
          </div>
          <Button className="mt-3" onClick={() => setLookedUp(true)}>
            Check Status
          </Button>

          {lookedUp ? (
            <div className="mt-5 border-t border-ash-200 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <p className="font-display text-xl font-semibold">#ADO1042</p>
                <Badge status="preparing">Preparing</Badge>
              </div>
              <ul>
                {TIMELINE.map((s) => (
                  <li key={s.label} className="flex gap-3 py-1 text-[15px]">
                    <span
                      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        s.done
                          ? "bg-lemon-600 text-white"
                          : "bg-white border border-ash-400 text-ash-600"
                      }`}
                    >
                      {s.done ? "✓" : "○"}
                    </span>
                    {s.label}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
