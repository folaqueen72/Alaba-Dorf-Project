"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "./ui/Button";
import { CopyButton } from "./OrderHistory";
import { koboToNaira } from "@/lib/format";

export function OrderSuccess({
  ref,
  total,
  note,
  payNow,
}: {
  ref: string;
  total?: number;
  note: string;
  payNow?: boolean;
}) {
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setPaying(true);
    setError(null);
    try {
      const res = await fetch("/api/pay/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref: ref.replace(/^#/, "") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Payment failed to start.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed to start.");
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="bg-lemon-100 border border-lemon-600 rounded-xl p-6 text-center">
      <p className="font-display text-3xl font-semibold">Order received!</p>
      <p className="mt-2 font-bold text-xl flex items-center justify-center gap-2">
        #{ref} <CopyButton text={ref} />
      </p>
      <p className="text-sm text-ash-600 mt-1">
        Save or copy your order number — you&apos;ll need it with your phone
        number to track this order.
      </p>
      {typeof total === "number" ? (
        <p className="text-ash-600 mt-1">Total: {koboToNaira(total)}</p>
      ) : null}
      <p className="text-sm text-ash-600 mt-2 max-w-md mx-auto">{note}</p>
      {payNow ? (
        <div className="mt-4">
          <Button onClick={pay} disabled={paying}>
            {paying ? "Opening payment…" : "Pay Now — Transfer or Card"}
          </Button>
          {error ? (
            <p className="text-sm font-semibold mt-2">{error}</p>
          ) : (
            <p className="text-sm text-ash-600 mt-1">
              Secure payment through Paystack.
            </p>
          )}
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        <Link href={`/track?orderNo=${encodeURIComponent(ref)}`}>
          <Button variant={payNow ? "outline" : "primary"} className={payNow ? "bg-white" : ""}>
            Track This Order
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" className="bg-white">
            Back Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
