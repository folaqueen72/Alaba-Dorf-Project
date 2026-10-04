"use client";

import { useState } from "react";
import { Button } from "../components/ui/Button";
import {
  CustomerFields,
  type CustomerInput,
} from "../components/CustomerFields";
import { OrderSuccess } from "../components/OrderSuccess";

export type SessionLine = { id: string; name: string; meta: string };
export type SlotLine = {
  id: string;
  dateLabel: string;
  label: string;
  taken: boolean;
};

export function StudioBooking({
  sessions,
  slots,
}: {
  sessions: SessionLine[];
  slots: SlotLine[];
}) {
  const [sessionId, setSessionId] = useState(sessions[0]?.id ?? "");
  const [slotId, setSlotId] = useState<string | null>(null);
  const [customer, setCustomer] = useState<CustomerInput>({
    name: "",
    phone: "",
    address: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<string | null>(null);

  if (placed) {
    return (
      <OrderSuccess
        ref={placed}
        note="Your slot don lock — nobody else fit book am. We go confirm payment and session details with you."
      />
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!slotId) {
      setError("Pick a free time slot first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionTypeId: sessionId, slotId, customer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Booking failed.");
      setPlaced(data.bookingId.slice(0, 8).toUpperCase());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed.");
    } finally {
      setBusy(false);
    }
  }

  const dates = [...new Set(slots.map((s) => s.dateLabel))];

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        {sessions.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSessionId(s.id)}
            className={`text-left border rounded-[10px] p-3 ${
              sessionId === s.id
                ? "bg-lemon-50 border-lemon-600"
                : "bg-white border-ash-400"
            }`}
          >
            <p className="font-bold">{s.name}</p>
            <p className="text-sm text-ash-600">{s.meta}</p>
          </button>
        ))}
      </div>

      {dates.length === 0 ? (
        <p className="font-semibold">
          No open slots right now. Check back — new dates dey drop regularly.
        </p>
      ) : (
        dates.map((d) => (
          <div key={d}>
            <p className="font-bold mb-2">{d}</p>
            <div className="grid grid-cols-2 gap-2">
              {slots
                .filter((s) => s.dateLabel === d)
                .map((s) =>
                  s.taken ? (
                    <div
                      key={s.id}
                      className="border border-ash-200 bg-ash-100 text-ash-400 rounded-lg p-3 text-center text-sm font-semibold line-through"
                    >
                      {s.label}
                    </div>
                  ) : (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSlotId(s.id)}
                      className={`border rounded-lg p-3 text-center text-sm font-semibold ${
                        slotId === s.id
                          ? "bg-lemon-600 border-lemon-600 text-white"
                          : "bg-white border-ash-400"
                      }`}
                    >
                      {s.label}
                    </button>
                  )
                )}
            </div>
          </div>
        ))
      )}

      {slotId ? (
        <CustomerFields
          value={customer}
          onChange={setCustomer}
          needAddress={false}
        />
      ) : null}
      {error ? <p className="text-sm font-semibold">{error}</p> : null}
      <Button className="w-full" disabled={busy || !slotId}>
        {busy ? "Locking your slot…" : "Book This Slot"}
      </Button>
    </form>
  );
}
