import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { Card } from "../components/ui/Card";
import { StudioBooking, type SessionLine, type SlotLine } from "./StudioBooking";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function fmtDay(d: Date): string {
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

export default async function StudioPage() {
  const [sessions, slots] = await Promise.all([
    prisma.sessionType.findMany({
      where: { active: true },
      orderBy: { durationMin: "asc" },
    }),
    prisma.studioSlot.findMany({
      where: { status: { in: ["AVAILABLE", "BOOKED"] } },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 40,
    }),
  ]);

  const sessionLines: SessionLine[] = sessions.map((s) => ({
    id: s.id,
    name: s.name,
    meta: `${s.durationMin} minutes`,
  }));
  const slotLines: SlotLine[] = slots.map((s) => ({
    id: s.id,
    dateLabel: fmtDay(s.date),
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
          Pick a session, grab a free slot. Once you book am, e don lock — no
          double booking.
        </p>
        <Card>
          <StudioBooking sessions={sessionLines} slots={slotLines} />
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
