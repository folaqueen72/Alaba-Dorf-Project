import { prisma } from "@/lib/prisma";
import { adminGuard } from "@/lib/adminGuard";
import { logActivity } from "@/lib/activity";
import { BOOKING_NEXT } from "@/lib/workflow";

const HOURS = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
const ENDS: Record<string, string> = {
  "10:00": "11:00",
  "11:00": "12:00",
  "12:00": "13:00",
  "13:00": "14:00",
  "14:00": "15:00",
  "15:00": "16:00",
};

// GET /api/admin/slots?from=YYYY-MM-DD&to=YYYY-MM-DD → slots + bookings
export async function GET(req: Request) {
  const gate = await adminGuard(req, ["STUDIO"]);
  if ("error" in gate) return gate.error;
  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const slots = await prisma.studioSlot.findMany({
    where: {
      ...(from ? { date: { gte: new Date(from) } } : {}),
      ...(to ? { date: { lte: new Date(to) } } : {}),
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    take: 500,
  });
  const bookings = await prisma.booking.findMany({
    where: {
      ...(from || to
        ? {
            slot: {
              ...(from ? { date: { gte: new Date(from) } } : {}),
              ...(to ? { date: { lte: new Date(to) } } : {}),
            },
          }
        : {}),
    },
    include: { customer: true, sessionType: true, slot: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return Response.json({ slots, bookings });
}

// POST {date} → open the standard 6 slots for a day
// POST {date, block:true} → block the whole day
export async function POST(req: Request) {
  const gate = await adminGuard(req, ["STUDIO"]);
  if ("error" in gate) return gate.error;
  const body = await req.json().catch(() => null);
  const { date, block } = body ?? {};
  try {
    if (!date || isNaN(Date.parse(date))) throw new Error("Pick a date.");
    const day = new Date(date);
    if (block) {
      await prisma.studioSlot.updateMany({
        where: { date: day, status: "AVAILABLE" },
        data: { status: "BLOCKED" },
      });
      await logActivity(prisma, {
        actorId: gate.user.id,
        action: "day blocked",
        entity: "studio_slot",
        entityId: date,
      });
      return Response.json({ ok: true });
    }
    for (const start of HOURS) {
      await prisma.studioSlot.upsert({
        where: { date_startTime: { date: day, startTime: start } },
        update: {},
        create: { date: day, startTime: start, endTime: ENDS[start] },
      });
    }
    await logActivity(prisma, {
      actorId: gate.user.id,
      action: "day opened",
      entity: "studio_slot",
      entityId: date,
    });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Failed." },
      { status: 400 }
    );
  }
}

// PATCH {slotId, status: BLOCKED|AVAILABLE} | {bookingId, status}
export async function PATCH(req: Request) {
  const gate = await adminGuard(req, ["STUDIO"]);
  if ("error" in gate) return gate.error;
  const body = await req.json().catch(() => null);
  try {
    if (body.slotId) {
      if (!["BLOCKED", "AVAILABLE"].includes(body.status))
        throw new Error("Invalid slot status.");
      const slot = await prisma.studioSlot.findUnique({
        where: { id: body.slotId },
      });
      if (!slot || slot.status === "BOOKED")
        throw new Error("Booked slots cannot change.");
      const updated = await prisma.studioSlot.update({
        where: { id: body.slotId },
        data: { status: body.status },
      });
      await logActivity(prisma, {
        actorId: gate.user.id,
        action: `slot ${body.status.toLowerCase()}`,
        entity: "studio_slot",
        entityId: body.slotId,
      });
      return Response.json({ slot: updated });
    }
    if (body.bookingId) {
      const result = await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findUnique({
          where: { id: body.bookingId },
        });
        if (!booking) throw new Error("Booking not found.");
        if (!BOOKING_NEXT[booking.status].includes(body.status))
          throw new Error(
            `Cannot move ${booking.status} to ${body.status}.`
          );
        const updated = await tx.booking.update({
          where: { id: body.bookingId },
          data: { status: body.status },
        });
        if (body.status === "CANCELLED") {
          await tx.studioSlot.update({
            where: { id: booking.slotId },
            data: { status: "AVAILABLE" },
          });
        }
        await logActivity(tx, {
          actorId: gate.user.id,
          action: `booking ${body.status.toLowerCase()}`,
          entity: "booking",
          entityId: booking.id,
        });
        return updated;
      });
      return Response.json({ booking: result });
    }
    throw new Error("Invalid request.");
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Failed." },
      { status: 400 }
    );
  }
}
