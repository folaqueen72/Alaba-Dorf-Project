import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { Card } from "../components/ui/Card";
import { StudioBooking, type SessionLine, type SlotLine } from "./StudioBooking";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function fmtDay(d: Date): string {
  return d.toLocaleDateString("en-NG", { weekday: "short", day: "numeric" });
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
  searchParams: Promise<{ date?: string }>;
}) {
  const sp = await searchParams;
  const [sessions, days] = await Promise.all([
    prisma.sessionType.findMany({
      where: { active: true },
      orderBy: { durationMin: "asc" },
    }),
    prisma.studioSlot.findMany({
      where: { status: { in: ["AVAILABLE", "BOOKED"] } },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 200,
    }),
  ]);

  // Group slots by day; drop past days.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const byDay = new Map<string, typeof days>();
  for (const s of days) {
    if (s.date < today) continue;
    const k = dayKey(s.date);
    const list = byDay.get(k) ?? [];
    list.push(s);
    byDay.set(k, list);
  }
  const keys = [...byDay.keys()].sort().slice(0, 14);
  const selected = sp.date && byDay.has(sp.date) ? sp.date : keys[0] ?? null;
  const daySlots = selected ? (byDay.get(selected) ?? []) : [];

  const sessionLines: SessionLine[] = sessions.map((s) => ({
    id: s.id,
    name: s.name,
    meta: `${s.durationMin} minutes`,
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
          Pick a session and a day, then grab a free slot. Booked slots show
          as taken the moment someone else takes them.
        </p>
        <Card>
          {keys.length === 0 ? (
            <p className="font-semibold">
              No open days right now. Check back — new dates are added
              regularly.
            </p>
          ) : (
            <>
              <p className="font-bold mb-2">Choose a day</p>
              <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                {keys.map((k) => {
                  const d = byDay.get(k)![0].date;
                  const free = byDay.get(k)!.filter(
                    (s) => s.status === "AVAILABLE"
                  ).length;
                  const active = k === selected;
                  return (
                    <Link
                      key={k}
                      href={`/studio?date=${k}`}
                      className={`flex-shrink-0 border rounded-[10px] px-4 py-2 text-center ${
                        active
                          ? "bg-ink text-white border-ink"
                          : "bg-white border-ash-400"
                      }`}
                    >
                      <span className="block text-sm font-bold">
                        {fmtDay(d)}
                      </span>
                      <span
                        className={`block text-xs ${active ? "text-ash-200" : "text-ash-600"}`}
                      >
                        {free === 0 ? "Full" : `${free} free`}
                      </span>
                    </Link>
                  );
                })}
              </div>
              <StudioBooking sessions={sessionLines} slots={slotLines} />
            </>
          )}
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
