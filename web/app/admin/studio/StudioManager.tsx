"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { koboToNaira } from "@/lib/format";

type Slot = {
  id: string;
  date: string;
  startTime: string;
  status: string;
};

type Booking = {
  id: string;
  status: string;
  sessionType: { name: string };
  slot: { date: string; startTime: string };
  customer: { name: string; phone: string };
};

function dayKey(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export function StudioManager() {
  const [date, setDate] = useState(dayKey(0));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [sessions, setSessions] = useState<
    Array<{ id: string; name: string; durationMin: number; price: number; active: boolean }>
  >([]);
  const [sForm, setSForm] = useState({ name: "", durationMin: "", price: "" });

  const load = useCallback(async () => {
    const res = await fetch(
      `/api/admin/slots?from=${date}&to=${date}T23:59:59`
    );
    const data = await res.json();
    if (res.ok) {
      setSlots(data.slots);
      setBookings(data.bookings);
    } else setMsg(data.error ?? "Could not load calendar.");
    const sres = await fetch("/api/admin/sessions");
    const sdata = await sres.json();
    if (sres.ok) setSessions(sdata.sessions);
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  async function day(action: "open" | "block") {
    setMsg(null);
    const res = await fetch("/api/admin/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, block: action === "block" }),
    });
    const data = await res.json();
    if (!res.ok) setMsg(data.error ?? "Failed.");
    else setMsg(action === "open" ? "Day opened." : "Day blocked.");
    load();
  }

  async function slot(id: string, status: string) {
    const res = await fetch("/api/admin/slots", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId: id, status }),
    });
    const data = await res.json();
    if (!res.ok) setMsg(data.error ?? "Failed.");
    load();
  }

  async function booking(id: string, status: string) {
    const res = await fetch("/api/admin/slots", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: id, status }),
    });
    const data = await res.json();
    if (!res.ok) setMsg(data.error ?? "Failed.");
    load();
  }

  async function saveSession(
    id: string | null,
    fields: { name?: string; durationMin?: string; price?: string; active?: boolean }
  ) {
    setMsg(null);
    const res = await fetch("/api/admin/sessions", {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(id ? { id } : {}),
        ...(fields.name !== undefined ? { name: fields.name } : {}),
        ...(fields.durationMin
          ? { durationMin: Number(fields.durationMin) }
          : {}),
        ...(fields.price !== undefined && fields.price !== ""
          ? { price: Math.round(Number(fields.price) * 100) }
          : {}),
        ...(fields.active !== undefined ? { active: fields.active } : {}),
      }),
    });
    const data = await res.json();
    if (!res.ok) setMsg(data.error ?? "Save failed.");
    else {
      setSForm({ name: "", durationMin: "", price: "" });
      setMsg("Session saved — customers see the new price immediately.");
    }
    load();
  }

  return (
    <>
      <Card title="Session types & prices">
        <div className="space-y-2 mt-2">
          {sessions.map((s) => (
            <SessionRow key={s.id} session={s} onSave={saveSession} />
          ))}
          {sessions.length === 0 ? (
            <p className="text-sm text-ash-600">No sessions yet.</p>
          ) : null}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveSession(null, sForm);
          }}
          className="grid gap-2 sm:grid-cols-4 mt-3 items-end"
        >
          <label className="block">
            <span className="block text-sm font-semibold mb-1">Name</span>
            <input
              required
              value={sForm.name}
              onChange={(e) => setSForm({ ...sForm, name: e.target.value })}
              placeholder="Basic Session"
              className="w-full border border-ash-400 rounded-[10px] px-3 py-2 text-sm outline-none focus:border-lemon-600"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold mb-1">Minutes</span>
            <input
              required
              type="number"
              min={1}
              value={sForm.durationMin}
              onChange={(e) =>
                setSForm({ ...sForm, durationMin: e.target.value })
              }
              className="w-full border border-ash-400 rounded-[10px] px-3 py-2 text-sm outline-none focus:border-lemon-600"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold mb-1">Price (₦)</span>
            <input
              required
              type="number"
              min={0}
              value={sForm.price}
              onChange={(e) => setSForm({ ...sForm, price: e.target.value })}
              className="w-full border border-ash-400 rounded-[10px] px-3 py-2 text-sm outline-none focus:border-lemon-600"
            />
          </label>
          <Button size="sm">Add Session</Button>
        </form>
      </Card>

      <Card title="Calendar day" className="mt-4">
        <div className="flex flex-wrap gap-2 items-end">
          <label className="block">
            <span className="block text-sm font-semibold mb-1">Day</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-ash-400 rounded-[10px] px-3 py-2 bg-white"
            />
          </label>
          <Button size="sm" onClick={() => day("open")}>
            Open Standard Day
          </Button>
          <Button size="sm" variant="outline" onClick={() => day("block")}>
            Block Day
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
          {slots.map((s) => (
            <div
              key={s.id}
              className={`border rounded-[10px] p-2 text-sm ${
                s.status === "BOOKED"
                  ? "bg-ash-100 border-ash-200 text-ash-600"
                  : s.status === "BLOCKED"
                    ? "bg-ink text-white border-ink"
                    : "bg-white border-ash-400"
              }`}
            >
              <p className="font-bold">{s.startTime}</p>
              <p className="text-xs mb-1">{s.status}</p>
              {s.status === "AVAILABLE" ? (
                <button
                  onClick={() => slot(s.id, "BLOCKED")}
                  className="text-xs font-bold underline underline-offset-2"
                >
                  Block
                </button>
              ) : s.status === "BLOCKED" ? (
                <button
                  onClick={() => slot(s.id, "AVAILABLE")}
                  className="text-xs font-bold underline underline-offset-2"
                >
                  Unblock
                </button>
              ) : null}
            </div>
          ))}
        </div>
        {slots.length === 0 ? (
          <p className="text-sm text-ash-600 mt-2">
            No slots this day — open a standard day above.
          </p>
        ) : null}
      </Card>

      <Card title="Bookings" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm mt-1">
            <thead>
              <tr className="text-left text-ash-600 border-b border-ash-200">
                <th className="py-2 pr-3">Ref</th>
                <th className="py-2 pr-3">Customer</th>
                <th className="py-2 pr-3">Session</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 30).map((b) => (
                <tr key={b.id} className="border-b border-ash-100">
                  <td className="py-2 pr-3 font-bold">
                    {b.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="py-2 pr-3">
                    {b.customer.name}
                    <span className="block text-ash-600">
                      {b.customer.phone}
                    </span>
                  </td>
                  <td className="py-2 pr-3">
                    {b.sessionType.name}
                    <span className="block text-ash-600">
                      {b.slot.startTime}
                    </span>
                  </td>
                  <td className="py-2 pr-3">
                    <Badge
                      status={
                        b.status === "CANCELLED"
                          ? "failed"
                          : b.status === "PENDING_PAYMENT"
                            ? "pending"
                            : "preparing"
                      }
                    >
                      {b.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-1">
                      {b.status === "PENDING_PAYMENT" ? (
                        <Button
                          size="sm"
                          onClick={() => booking(b.id, "CONFIRMED")}
                        >
                          Confirm
                        </Button>
                      ) : null}
                      {b.status === "CONFIRMED" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => booking(b.id, "UPCOMING")}
                        >
                          Upcoming
                        </Button>
                      ) : null}
                      {b.status === "UPCOMING" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => booking(b.id, "COMPLETED")}
                        >
                          Complete
                        </Button>
                      ) : null}
                      {b.status !== "COMPLETED" &&
                      b.status !== "CANCELLED" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => booking(b.id, "CANCELLED")}
                        >
                          Cancel
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {msg ? <p className="text-sm font-semibold mt-2">{msg}</p> : null}
        <Link
          href="/admin/activity"
          className="inline-block mt-2 text-sm font-bold text-lemon-800 underline underline-offset-4"
        >
          View activity log
        </Link>
      </Card>
    </>
  );
}

function SessionRow({
  session: s,
  onSave,
}: {
  session: {
    id: string;
    name: string;
    durationMin: number;
    price: number;
    active: boolean;
  };
  onSave: (
    id: string | null,
    fields: { name?: string; durationMin?: string; price?: string; active?: boolean }
  ) => void;
}) {
  const [price, setPrice] = useState("");
  return (
    <div className="border border-ash-200 rounded-[10px] p-2 flex flex-wrap items-center gap-2 text-sm">
      <div>
        <p className="font-bold">{s.name}</p>
        <p className="text-ash-600">
          {s.durationMin} min · {koboToNaira(s.price)}
          {!s.active ? " · hidden" : ""}
        </p>
      </div>
      <div className="ml-auto flex items-center gap-1">
        <input
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="New ₦ price"
          className="w-28 border border-ash-400 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-lemon-600"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            onSave(s.id, { price });
            setPrice("");
          }}
        >
          Set Price
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onSave(s.id, { active: !s.active })}
        >
          {s.active ? "Hide" : "Show"}
        </Button>
      </div>
    </div>
  );
}
