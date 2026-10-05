import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { Card } from "../components/ui/Card";
import { StudioBooking, type SessionLine, type SlotLine } from "./StudioBooking";
import { prisma } from "@/lib/prisma";
import { koboToNaira } from "@/lib/format";

export const dynamic = "force-dynamic";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fmtFull(d: Date): string {
  return d.toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function fmtTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, "0")} ${suffix}`;
}

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; month?: string }>;
}) {
  const sp = await searchParams;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Visible month (default: current).
  const [vy, vm] = (sp.month ?? "").split("-").map(Number);
  const viewYear = Number.isInteger(vy) && vy > 2000 ? vy : today.getFullYear();
  const viewMonth =
    Number.isInteger(vm) && vm >= 1 && vm <= 12 ? vm - 1 : today.getMonth();
  const monthStart = new Date(viewYear, viewMonth, 1);
  const monthEnd = new Date(viewYear, viewMonth + 1, 0);
  const prevMonth = new Date(viewYear, viewMonth - 1, 1);
  const nextMonth = new Date(viewYear, viewMonth + 1, 1);
  const monthLabel = monthStart.toLocaleDateString("en-NG", {
    month: "long",
    year: "numeric",
  });
  const prevKey = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;
  const nextKey = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;

  const [sessions, slots] = await Promise.all([
    prisma.sessionType.findMany({
      where: { active: true },
      orderBy: { durationMin: "asc" },
    }),
    prisma.studioSlot.findMany({
      where: {
        date: { gte: monthStart, lte: monthEnd },
        status: { in: ["AVAILABLE", "BOOKED"] },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 400,
    }),
  ]);

  const byDay = new Map<string, typeof slots>();
  for (const s of slots) {
    const k = dayKey(s.date);
    const list = byDay.get(k) ?? [];
    list.push(s);
    byDay.set(k, list);
  }

  const days = [...byDay.keys()].sort();
  const selected =
    sp.date && byDay.has(sp.date) && new Date(sp.date) >= today
      ? sp.date
      : (days.find((k) => new Date(k) >= today) ?? null);
  const daySlots = selected ? (byDay.get(selected) ?? []) : [];

  // Calendar cells: Monday-first grid.
  const leadBlanks = (monthStart.getDay() + 6) % 7;
  const cells: Array<Date | null> = [
    ...Array<null>(leadBlanks).fill(null),
    ...Array.from(
      { length: monthEnd.getDate() },
      (_, i) => new Date(viewYear, viewMonth, i + 1)
    ),
  ];

  const sessionLines: SessionLine[] = sessions.map((s) => ({
    id: s.id,
    name: s.name,
    meta:
      s.price > 0
        ? `${s.durationMin} minutes · ${koboToNaira(s.price)}`
        : `${s.durationMin} minutes · price to be confirmed`,
  }));
  const slotLines: SlotLine[] = daySlots.map((s) => ({
    id: s.id,
    dateLabel: selected ? fmtFull(s.date) : "",
    label: fmtTime(s.startTime),
    taken: s.status !== "AVAILABLE",
  }));

  return (
    <>
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-4 w-full">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-6 mb-1">
          Photo Studio
        </h1>
        <p className="text-ash-600 mb-4">
          Sessions are prepaid by transfer or card. Pick a day, then a free
          slot — taken slots show immediately and cannot be double-booked.
        </p>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <Link
              href={`/studio?month=${prevKey}`}
              className="px-3 py-2 rounded-[10px] border border-ash-400 text-sm font-bold"
            >
              ← Prev
            </Link>
            <p className="font-display text-xl font-semibold">{monthLabel}</p>
            <Link
              href={`/studio?month=${nextKey}`}
              className="px-3 py-2 rounded-[10px] border border-ash-400 text-sm font-bold"
            >
              Next →
            </Link>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-ash-600 mb-1">
            {WEEKDAYS.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (!d) return <span key={`b${i}`} />;
              const k = dayKey(d);
              const list = byDay.get(k);
              const past = d < today;
              const free = list?.filter((s) => s.status === "AVAILABLE").length ?? 0;
              const active = k === selected;
              if (!list || past) {
                return (
                  <span
                    key={k}
                    className={`rounded-lg py-2 text-sm ${
                      past ? "text-ash-200" : "text-ash-400 bg-ash-100"
                    }`}
                  >
                    {d.getDate()}
                  </span>
                );
              }
              return (
                <Link
                  key={k}
                  href={`/studio?month=${viewYear}-${String(viewMonth + 1).padStart(2, "0")}&date=${k}`}
                  className={`rounded-lg py-1.5 text-sm font-bold border ${
                    active
                      ? "bg-ink text-white border-ink"
                      : free === 0
                        ? "bg-white border-ash-200 text-ash-400 line-through"
                        : "bg-lemon-50 border-lemon-600 text-lemon-800"
                  }`}
                >
                  {d.getDate()}
                  <span
                    className={`block text-[10px] font-semibold ${
                      active ? "text-ash-200" : "text-ash-600"
                    }`}
                  >
                    {free === 0 ? "full" : `${free} free`}
                  </span>
                </Link>
              );
            })}
          </div>
        </Card>

        {selected ? (
          <Card title={fmtFull(new Date(selected + "T00:00:00"))} className="mt-4">
            <div className="mt-1">
              <StudioBooking sessions={sessionLines} slots={slotLines} />
            </div>
          </Card>
        ) : (
          <Card className="mt-4">
            <p className="font-semibold">
              No open days this month — pick another month or check back soon.
            </p>
          </Card>
        )}

        <Card title="Visit or call us" className="mt-4">
          <p className="text-[15px] mt-1">
            Behind Bodmas School, Ojoyeye, Olodo, Ibadan.
          </p>
          <a
            href="tel:09011544504"
            className="inline-block mt-2 font-display text-2xl font-semibold text-lemon-800"
          >
            0901 154 4504
          </a>
          <p className="text-sm text-ash-600 mt-1">
            Call for directions, bulk orders or anything the website cannot do
            yet.
          </p>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
