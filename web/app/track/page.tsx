"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { OrderHistory } from "../components/OrderHistory";
import { NotifyToggle } from "../components/Push";
import { koboToNaira } from "@/lib/format";

const ORDER_STEPS = [
  "Order received",
  "Payment confirmed",
  "Preparing",
  "Ready",
  "Completed",
];

const BOOKING_STEPS = ["Booked", "Payment confirmed", "Upcoming", "Completed"];

function stepIndex(status: string, booking: boolean): number {
  if (booking) {
    return {
      PENDING_PAYMENT: 0,
      CONFIRMED: 1,
      UPCOMING: 2,
      COMPLETED: 3,
      CANCELLED: -1,
    }[status] ?? 0;
  }
  return (
    {
      PENDING_PAYMENT: 0,
      CONFIRMED: 1,
      PREPARING: 2,
      READY: 3,
      OUT_FOR_DELIVERY: 3,
      COMPLETED: 4,
      CANCELLED: -1,
    }[status] ?? 0
  );
}

type Result = {
  type: "order" | "booking";
  ref: string;
  status: string;
  payment?: string;
  method?: string;
  items?: Array<{ name: string; qty: number; unitPrice: number }>;
  total?: number;
  session?: string;
  date?: string;
  slot?: string;
};

function statusLabel(s: string): string {
  return s
    .split("_")
    .map((w) => w[0] + w.slice(1).toLowerCase())
    .join(" ");
}

function TrackForm() {
  const params = useSearchParams();
  const [orderNo, setOrderNo] = useState(params.get("orderNo") ?? "");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [paying, setPaying] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const trxref = params.get("trxref") ?? params.get("reference");

  async function lookup(e?: React.FormEvent, override?: { ref: string; phone: string }) {
    e?.preventDefault();
    const ref = override?.ref ?? orderNo;
    const ph = override?.phone ?? phone;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(
        `/api/track?orderNo=${encodeURIComponent(ref)}&phone=${encodeURIComponent(ph)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Lookup failed.");
      setResult(data);
      setOrderNo(ref);
      setPhone(ph);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed.");
    } finally {
      setBusy(false);
    }
  }

  async function payNow() {
    if (!result) return;
    setPaying(true);
    setError(null);
    try {
      const res = await fetch("/api/pay/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref: result.ref.replace(/^#/, "") }),
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

  async function confirmPaid() {
    if (!result) return;
    setPaying(true);
    setError(null);
    try {
      const res = await fetch("/api/pay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNo: result.ref.replace(/^#/, "") }),
      });
      const data = await res.json();
      if (!res.ok || !data.paid)
        throw new Error(
          data.message ?? data.error ?? "Paystack has not confirmed this payment yet."
        );
      await lookup(undefined, { ref: result.ref, phone });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Confirmation failed.");
    } finally {
      setPaying(false);
    }
  }

  const booking = result?.type === "booking";
  const steps = booking ? BOOKING_STEPS : ORDER_STEPS;
  const idx = result ? stepIndex(result.status, booking) : 0;

  // Returning from Paystack: match the payment, verify it, load the order.
  useEffect(() => {
    if (!trxref || verifying || result) return;
    let cancelled = false;
    (async () => {
      setVerifying(true);
      setError(null);
      try {
        const mapRes = await fetch(
          `/api/pay/webhook?reference=${encodeURIComponent(trxref)}`
        );
        const map = await mapRes.json();
        if (!map.found)
          throw new Error(
            "We couldn't match that payment to an order. Enter your order number below."
          );
        await fetch("/api/pay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: trxref }),
        });
        if (!cancelled) await lookup(undefined, { ref: map.orderNo, phone: map.phone });
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Confirmation failed.");
      } finally {
        if (!cancelled) setVerifying(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trxref]);

  return (
    <Card>
      {verifying ? (
        <p className="font-semibold mb-3">
          Confirming your payment with Paystack — one moment…
        </p>
      ) : null}
      <form
        onSubmit={lookup}
        className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <label className="block">
          <span className="block text-sm font-semibold mb-1">
            Order number
          </span>
          <input
            required
            value={orderNo}
            onChange={(e) => setOrderNo(e.target.value)}
            placeholder="#ADO1042"
            className="w-full rounded-[10px] border border-ash-400 bg-white px-4 py-3 text-[15px] outline-none focus:border-lemon-600"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-semibold mb-1">
            Phone number
          </span>
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0803 000 0000"
            inputMode="tel"
            className="w-full rounded-[10px] border border-ash-400 bg-white px-4 py-3 text-[15px] outline-none focus:border-lemon-600"
          />
        </label>
        <Button disabled={busy}>{busy ? "Checking…" : "Check Status"}</Button>
      </form>
      {error ? <p className="text-sm font-semibold mt-3">{error}</p> : null}

      {result ? (
        <div className="mt-5 border-t border-ash-200 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <p className="font-display text-xl font-semibold">#{result.ref}</p>
            <Badge
              status={
                result.status === "COMPLETED"
                  ? "completed"
                  : result.status === "CANCELLED"
                    ? "failed"
                    : result.status === "PENDING_PAYMENT"
                      ? "pending"
                      : "preparing"
              }
            >
              {statusLabel(result.status)}
            </Badge>
            {result.payment && result.payment !== "PAID" ? (
              <Badge status="pending">
                Payment: {statusLabel(result.payment)}
              </Badge>
            ) : null}
            {result.method === "CASH" && result.payment !== "PAID" ? (
              <Badge status="info">Cash on delivery</Badge>
            ) : null}
          </div>
          {result.type === "order" &&
          result.payment === "UNPAID" &&
          result.method !== "CASH" ? (
            <div className="mb-3">
              <Button onClick={payNow} disabled={paying}>
                {paying ? "Opening payment…" : "Pay Online Now"}
              </Button>
              <p className="text-sm text-ash-600 mt-1">
                Card, transfer or USSD through Paystack.
              </p>
            </div>
          ) : null}
          {result.type === "order" &&
          result.payment === "PROCESSING" ? (
            <div className="mb-3">
              <Button onClick={confirmPaid} disabled={paying}>
                {paying ? "Confirming…" : "I've Paid — Confirm It"}
              </Button>
              <p className="text-sm text-ash-600 mt-1">
                Paid but still showing processing? Press this to confirm
                directly with Paystack.
              </p>
            </div>
          ) : null}
          {result.type === "order" &&
          result.payment === "UNPAID" &&
          result.method === "CASH" ? (
            <p className="text-sm text-ash-600 mb-3">
              No need to pay now — have your cash ready on collection or
              delivery.
            </p>
          ) : null}
          {result.type === "order" ? (
            <ul className="text-sm text-ash-600 mb-3">
              {(result.items ?? []).map((it, i) => (
                <li key={i}>
                  {it.qty} × {it.name} — {koboToNaira(it.unitPrice)}
                </li>
              ))}
              <li className="font-bold text-ink mt-1">
                Total: {koboToNaira(result.total ?? 0)}
              </li>
            </ul>
          ) : (
            <p className="text-sm text-ash-600 mb-3">
              {result.session} ·{" "}
              {result.date
                ? new Date(result.date).toLocaleDateString("en-NG", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })
                : ""}{" "}
              · {result.slot}
            </p>
          )}
          {result.status === "CANCELLED" ? (
            <p className="font-semibold">
              This order was cancelled. Please place a fresh order.
            </p>
          ) : (
            <ul>
              {steps.map((s, i) => (
                <li key={s} className="flex gap-3 py-1 text-[15px]">
                  <span
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i <= idx
                        ? "bg-lemon-600 text-white"
                        : "bg-white border border-ash-400 text-ash-600"
                    }`}
                  >
                    {i <= idx ? "✓" : "○"}
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
      <div className="mt-5 border-t border-ash-200 pt-2">
        <OrderHistory onPick={(ref, ph) => lookup(undefined, { ref, phone: ph })} />
        <NotifyToggle phone={phone} />
      </div>
    </Card>
  );
}

export default function TrackPage() {
  return (
    <>
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-4 w-full">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-6 mb-1">
          Track your order
        </h1>
        <p className="text-ash-600 mb-4">
          Use the same phone number you ordered with. No account needed.
        </p>
        <Suspense>
          <TrackForm />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
