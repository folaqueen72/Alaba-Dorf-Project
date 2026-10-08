"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { koboToNaira } from "@/lib/format";

type OrderRow = {
  orderNo: string;
  dept: string;
  total: number;
  orderStatus: string;
  createdAt: string;
};

type BookingRow = {
  ref: string;
  status: string;
  session: string;
  createdAt: string;
};

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  }
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        if (await copyText(text)) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }}
      className="text-xs font-bold px-2 py-1 rounded-lg border border-ash-400 bg-white hover:border-lemon-600"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
}

export function OrderHistory({
  onPick,
}: {
  onPick: (ref: string, phone: string) => void;
}) {
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [searched, setSearched] = useState(false);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/history?phone=${encodeURIComponent(phone)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed.");
      setOrders(data.orders);
      setBookings(data.bookings);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6">
      <h2 className="font-display text-2xl font-semibold">
        Don&apos;t have your order number?
      </h2>
      <p className="text-ash-600 text-sm mt-1 mb-3">
        Enter the phone number you ordered with to see all your orders. Tap
        one to track it, or copy the number.
      </p>
      <form onSubmit={search} className="flex gap-2">
        <input
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0803 000 0000"
          inputMode="tel"
          className="flex-1 rounded-[10px] border border-ash-400 bg-white px-4 py-3 text-[15px] outline-none focus:border-lemon-600"
        />
        <Button disabled={busy}>{busy ? "…" : "My Orders"}</Button>
      </form>
      {error ? <p className="text-sm font-semibold mt-2">{error}</p> : null}
      {searched && orders.length === 0 && bookings.length === 0 ? (
        <p className="text-sm text-ash-600 mt-3">
          No orders found for this number. Check for typos, or use the exact
          number you ordered with.
        </p>
      ) : null}
      <div className="mt-3 space-y-2">
        {orders.map((o) => (
          <div
            key={o.orderNo}
            className="border border-ash-200 bg-white rounded-[10px] p-3 flex flex-wrap items-center gap-2"
          >
            <div className="mr-auto">
              <p className="font-bold">
                #{o.orderNo}{" "}
                <span className="font-normal text-ash-600 text-sm">
                  · {o.dept} · {koboToNaira(o.total)} · {fmtDate(o.createdAt)}
                </span>
              </p>
              <span className="inline-block mt-1">
                <Badge
                  status={
                    o.orderStatus === "COMPLETED"
                      ? "completed"
                      : o.orderStatus === "CANCELLED"
                        ? "failed"
                        : o.orderStatus === "PENDING_PAYMENT"
                          ? "pending"
                          : "preparing"
                  }
                >
                  {o.orderStatus.replace(/_/g, " ")}
                </Badge>
              </span>
            </div>
            <CopyButton text={o.orderNo} />
            <Button size="sm" onClick={() => onPick(o.orderNo, phone)}>
              Track
            </Button>
          </div>
        ))}
        {bookings.map((b) => (
          <div
            key={b.ref}
            className="border border-ash-200 bg-white rounded-[10px] p-3"
          >
            <p className="font-bold">
              {b.session}{" "}
              <span className="font-normal text-ash-600 text-sm">
                · {fmtDate(b.createdAt)}
              </span>
            </p>
            <p className="text-sm text-ash-600">
              Booking ref: {b.ref} (use it with your phone number above to
              track)
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
